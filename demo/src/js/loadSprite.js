export default function loadSprite(url) {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    xhr.onload = () => {
        const container = document.createElement('div');
        container.setAttribute('hidden', '');
        container.innerHTML = xhr.responseText;
        document.body.insertBefore(container, document.body.childNodes[0]);
    };

    xhr.send();
}
