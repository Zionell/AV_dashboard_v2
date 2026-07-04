import { dbClient } from '~~/lib/dbClient';

interface IQuery {
    userId: string;
    range: string;
}

interface IParsedRange {
    start: string;
    end: string;
}

export default defineEventHandler(async (event) => {
    try {
        const { userId, range }: IQuery = getQuery(event);
        const parsedRange: IParsedRange = range ? JSON.parse(range) : null;

        console.log('range', parsedRange?.start);
        console.log('range', parsedRange?.end);

        const items = await dbClient.times.findMany({
            where: {
                // createdAt: {
                //     gt: parsedRange?.start ? parsedRange.start : '',
                //     lte: parsedRange?.end ? parsedRange.end : '',
                // },
                userId,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return items || [];
    } catch (e) {
        console.warn('Times all/ get: ', e);
        throw e;
    }
});
