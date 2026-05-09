// Share Manager for URL encoding and sharing
class ShareManager {
    static encodeDataToUrl(data) {
        try {
            const jsonString = JSON.stringify(data);
            const compressed = LZString.compressToEncodedURIComponent(jsonString);
            const url = new URL(window.location.href);
            url.searchParams.set('data', compressed);
            return url.toString();
        } catch (error) {
            console.error('Encoding error:', error);
            return null;
        }
    }

    static decodeDataFromUrl() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const compressed = urlParams.get('data');

            if (compressed) {
                const jsonString = LZString.decompressFromEncodedURIComponent(compressed);
                return JSON.parse(jsonString);
            }
            return null;
        } catch (error) {
            console.error('Decoding error:', error);
            return null;
        }
    }

    static generateQRCode(text, elementId) {
        const qrContainer = document.getElementById(elementId);
        if (qrContainer && window.QRCode) {
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: text,
                width: 200,
                height: 200,
                colorDark: "#7c3aed",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            return true;
        }
        return false;
    }

    static async shareViaWebShare(data, title) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: 'Check out this data dashboard!',
                    url: data
                });
                return true;
            } catch (error) {
                console.error('Share error:', error);
                return false;
            }
        }
        return false;
    }

    static createEmbedCode(url) {
        return `<iframe src="${url}" width="100%" height="600" frameborder="0" style="border:1px solid #7c3aed; border-radius:12px;"></iframe>`;
    }
}