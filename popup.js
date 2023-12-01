document.addEventListener('DOMContentLoaded', function() {
    var loginButton = document.getElementById('login-btn');
    loginButton.addEventListener('click', function() {
        loginWithFacebook();
    });
});

function loginWithFacebook() {
    var clientId = '1097249097872208';
    var redirectUri = 'https://ggehpmlgjdappfdakaefjcjmcdhleedk.chromiumapp.org/';

    var authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email,user_likes`;

    chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
    }, function(redirectUrl) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
            return;
        }
        var accessToken = extractToken(redirectUrl);
        fetchUserData(accessToken);
    });
}

function extractToken(url) {
    var match = url.match(/#access_token=([^&]+)/);
    return match ? match[1] : null;
}

function fetchUserData(token) {
    var xhr = new XMLHttpRequest();
    // Include 'likes' in the fields parameter
    xhr.open('GET', 'https://graph.facebook.com/me?fields=id,name,email,likes.limit(1).summary(true)&access_token=' + token);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var userData = JSON.parse(xhr.responseText);
            displayUserData(userData);
        } else {
            console.error('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send();
}

function displayUserData(data) {
    var displayArea = document.getElementById('user-data');

    // Extracting user details
    var userId = data.id;
    var userName = data.name;
    var userEmail = data.email;
    var userLikesCount = data.likes.summary.total_count;

    // Creating a neat display
    var displayContent = `
        <h3>User Information</h3>
        <p><strong>ID:</strong> ${userId}</p>
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Number of Likes:</strong> ${userLikesCount}</p>
    `;

    // Setting the innerHTML of the display area
    displayArea.innerHTML = displayContent;
}

