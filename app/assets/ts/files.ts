export const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => {
            const result = reader.result;
            if (typeof result === 'string') {
                resolve(result);
            } else {
                reject(new Error('Failed to convert file to base64 string'));
            }
        };

        reader.onerror = (error) => reject(error);
    });
