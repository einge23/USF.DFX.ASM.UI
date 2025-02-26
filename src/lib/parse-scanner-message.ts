export function parseScannerName(scannerMessage: string): string {
    try {
        const nameMatch = scannerMessage.match(/\^(.*?)\^/);
        if (!nameMatch) {
            throw new Error("Invalid scanner message format");
        }

        const [lastName, firstMiddle] = nameMatch[1].split("/");

        return `${firstMiddle} ${lastName}`;
    } catch (error) {
        console.error("Error parsing scanner name:", error);
        return "";
    }
}
