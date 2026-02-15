const submitButton = document.getElementById('submitButton');
const bypassInput = document.getElementById('bypassInput');

submitButton.disabled = true;
bypassInput.addEventListener('input', () => {
    submitButton.disabled = !isValidUrl(bypassInput.value.trim()) || !getHcaptcha();
});
window.addEventListener('load', () => {
    submitButton.disabled = !isValidUrl(bypassInput.value.trim()) || !getHcaptcha();
});
submitButton.addEventListener('click', bypassLink);

async function bypassLink() {
    submitButton.disabled = true;
    try {
        const response = await apiRequest(bypassInput.value);
        if (response.status == 'success') {
            bypassInput.value = null;
            showPopup(response.result);
        } else if (response.status == 'error') {
            showPopup(response.message);
        } else {
            showPopup('An unknown error occurred');
        }
    } catch (e) {
        console.log(e);
        showPopup(e.message || 'Error contacting API, please try again later.');
    } finally {
        submitButton.disabled = !bypassInput.value;
    }
}
