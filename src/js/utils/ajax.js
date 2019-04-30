/**
 * Makes the JSONP request to get the social network to get the share count.
 *
 * @param {string} url          - The URL of the of the sharing API.
 * @param {function} callback   - The callback funciton once the API completes the request.
 */
export function getJSONP(url) {
    return new Promise((resolve, reject) => {
        // Generate a random callback
        const name = `jsonp_callback_${Math.round(100000 * Math.random())}`;
        // Create a faux script
        const script = document.createElement('script');

        // Handle errors
        script.addEventListener('error', error => reject(error));

        // Cleanup to prevent memory leaks and hit original callback
        window[name] = data => {
            delete window[name];
            document.body.removeChild(script);
            resolve(data);
        };

        // Add callback to URL
        const src = new URL(url);
        src.searchParams.set('callback', name);

        // Set src and load
        script.setAttribute('src', src.toString());

        // Inject to the body
        document.body.appendChild(script);
    });
}

export default { getJSONP };
