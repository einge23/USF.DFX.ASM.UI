export const formatName = (name: string): string => {
    const nameParts = name.split(" ");
    const formattedNameParts = nameParts.map((part) => {
        if (part.length > 2) {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }
        return part.toUpperCase();
    });

    if (formattedNameParts.length === 0) {
        return ""; // Handle empty case
    } else if (formattedNameParts.length === 1) {
        return formattedNameParts[0]; // Only one part
    } else {
        // Return first and last parts joined by a space
        return `${formattedNameParts[0]} ${
            formattedNameParts[formattedNameParts.length - 1]
        }`;
    }
};
