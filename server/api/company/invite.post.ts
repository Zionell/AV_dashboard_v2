import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';
import { INVITE_TTL_DAYS } from '#shared/constants';

const bodySchema = z.object({
    email: z.email('Invalid email'),
    // Норма рабочего дня приглашённого — от неё считается его переработка.
    workHours: z.number().int().min(1, 'At least 1 hour').max(24, 'At most 24 hours').default(8),
});

// Приглашение в компанию — только owner (кнопка на странице Company).
export default defineEventHandler(async (event) => {
    try {
        const user = requireRole(event, EUserRole.OWNER);
        const companyId = requireCompanyId(event);
        const { email, workHours } = await readValidatedBody(event, bodySchema.parse);

        // Место должно быть свободно уже на отправке — звать человека в полную компанию
        // бессмысленно. При принятии проверим ещё раз: места могут кончиться за это время.
        await assertSeatAvailable(companyId);

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { name: true },
        });

        const existing = await prisma.user.findUnique({
            where: { email },
            select: { companyId: true },
        });

        if (existing?.companyId === companyId) {
            throw createError({ statusCode: 400, message: 'This user is already in your company' });
        }

        const inviter = await prisma.user.findUnique({
            where: { id: user.id },
            select: { name: true },
        });

        // Прошлые непринятые приглашения этой почте гасим: иначе по старой ссылке
        // человек вошёл бы с неактуальной нормой часов.
        // На Mongo `acceptedAt: null` не матчит отсутствующее поле (у новых приглашений
        // оно не выставлено) — нужен ещё isSet: false, иначе старые ссылки не гаснут.
        await prisma.invitation.deleteMany({
            where: { email, companyId, OR: [{ acceptedAt: null }, { acceptedAt: { isSet: false } }] },
        });

        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

        await prisma.invitation.create({
            data: { email, token, workHours, companyId, invitedById: user.id, expiresAt },
        });

        // Из конфига, а не из origin запроса: за прокси/CDN там может оказаться внутренний адрес.
        // SITE_URL может быть с хвостовым слешем — срезаем, чтобы не получить `//login`.
        const origin = ((useRuntimeConfig(event).SITE_URL as string) || getRequestURL(event).origin).replace(
            /\/+$/,
            ''
        );

        await sendMail({
            to: email,
            subject: `Invitation to join ${company?.name}`,
            text: [
                `${inviter?.name || 'A colleague'} invites you to join ${company?.name} on AV Dashboard.`,
                '',
                `To accept the invitation, sign in or sign up here: ${origin}/?token=${token}`,
                `The link expires in ${INVITE_TTL_DAYS} days.`,
                '',
                "If you weren't expecting this email, just ignore it.",
            ].join('\n'),
        });

        return { ok: true };
    } catch (e) {
        logger.warn('Company/invite post: ', e);
        throw e;
    }
});
