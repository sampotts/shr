export function getDomain(href) {
    const url = new URL(href);
    let domain = url.hostname;
    const parts = domain.split('.');
    const { length } = parts;

    // Extract the root domain
    if (length > 2) {
        domain = `${parts[length - 2]}.${parts[length - 1]}`;

        // Check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (parts[length - 2].length === 2 && parts[length - 1].length === 2) {
            domain = `${parts[length - 3]}.${domain}`;
        }
    }

    return domain;
}

export default {};
