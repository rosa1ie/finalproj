document.addEventListener('DOMContentLoaded', function () {
    var loginButton = document.getElementById('login-btn');

    // Check if the user is already logged in
    if (localStorage.getItem('accessToken')) {
        fetchUserData(localStorage.getItem('accessToken'));
        loginButton.textContent = 'Log Out';
    }

    loginButton.addEventListener('click', function () {
        if (loginButton.textContent === 'Log In') {
            loginWithFacebook();
        } else {
            logout();
        }
    });
});

function loginWithFacebook() {
    var clientId = '1097249097872208';
    var redirectUri = 'https://ggehpmlgjdappfdakaefjcjmcdhleedk.chromiumapp.org/';

    var authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email,user_likes,user_birthday,user_gender,user_hometown,user_location,ads_management&auth_type=reauthenticate`;

    chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
    }, function (redirectUrl) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
            return;
        }
        var accessToken = extractToken(redirectUrl);
        localStorage.setItem('accessToken', accessToken);
        fetchUserData(accessToken);
    });

    var loginButton = document.getElementById('login-btn');
    loginButton.textContent = 'Log Out';
}

function logout() {
    // Clear user data and access token
    localStorage.removeItem('accessToken');
    document.getElementById('user-data').innerHTML = '';
    document.getElementById('login-btn').textContent = 'Log In';

    // Redirect to Facebook logout URL
    var logoutUrl = `https://www.facebook.com/logout.php?next=${encodeURIComponent(window.location.href)}&access_token=${localStorage.getItem('accessToken')}`;
    window.location.href = logoutUrl;
}

function extractToken(url) {
    var match = url.match(/#access_token=([^&]+)/);
    return match ? match[1] : null;
}

function fetchUserData(token) {
    var xhr = new XMLHttpRequest();
    // Include 'likes' in the fields parameter
    xhr.open('GET', 'https://graph.facebook.com/me?fields=id,name,email,birthday,gender,hometown,location,likes.limit(1).summary(true),age_range,installed&access_token=' + token);
    xhr.onload = function () {
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
    var userName = data.name ? data.name : 'Not Collected';
    var userEmail = data.email ? data.email : 'Not Collected';
    var userLikesCount = data.likes.summary.total_count ? data.likes.summary.total_count : 'Not Collected';
    var userBirthday = data.birthday ? data.birthday : 'Not Collected';
    var userGender = data.gender ? data.gender : 'Not Collected';
    var userHometown = data.hometown ? data.hometown.name : 'Not Collected';
    var userLocation = data.location ? data.location.name : 'Not Collected';
    var userAgeRange = data.age_range ? `${data.age_range.min} - ${data.age_range.max}` : 'Not Collected';
    var isInstalled = data.installed ? 'Yes' : 'No';


    // Creating a neat display
    var displayContent = `
            <h3>Information Collected by Meta</h3>
            <h3>Accessible Data</h3>
            <hr>
            <p><strong>App Installed:</strong> ${isInstalled}</p>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Age Range:</strong> ${userAgeRange}</p>
            <p><strong>Birthday:</strong> ${userBirthday}</p>
            <p><strong>Gender:</strong> ${userGender}</p>
            <p><strong>Hometown:</strong> ${userHometown}</p>
            <p><strong>Current Location:</strong> ${userLocation}</p>
            <p><strong>Number of Facebook Pages liked:</strong> ${userLikesCount}</p><br>
            <h3>Not accessible but being collected</h3>
            <hr>
            <p><strong>Credit card numbers</p>
            <p><strong>Content of messages</p>
            <p><strong>Health-related information</p>
            <p><strong>Data from voice commands</p>
            <p><strong>Facial recognition data</p>
            <p><strong>Interactions with websites</p>

        `;

    // Setting the innerHTML of the display area
    displayArea.innerHTML = displayContent;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('switchToContent2').addEventListener('click', function () {
        document.getElementById('content1').style.display = 'none';
        document.getElementById('content2').style.display = 'block';
    });

    document.getElementById('switchToContent1').addEventListener('click', function () {
        document.getElementById('content2').style.display = 'none';
        document.getElementById('content1').style.display = 'block';
    });
});

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        const url = details.url;
        const method = details.method;
        const headers = details.requestHeaders;
        const requestData = {
            url: url,
            method: method,
            headers: headers
        };
        if (url == document) {
            const personalData = JSON.stringify(requestData, null, 2);
            const userDataElement = document.createElement("pre");
            userDataElement.innerText = personalData;
            document.body.appendChild(userDataElement);
            console.info(personalData);


            // const personalDataKeywords = ["name", "email", "address", "phone"];
            // const hasPersonalData = personalDataKeywords.some(keyword => personalData.toLowerCase().includes(keyword));
            // if (hasPersonalData) {
            //     // Perform actions when personal data is detected
            //     console.warn("Personal data detected in the request:", personalData);
            //     // Add your code here to handle the personal data

            //     // Example: Send personal data to a server for logging or analysis
            //     fetch('https://example.com/log-personal-data', {
            //         method: 'POST',
            //         headers: {
            //             'Content-Type': 'application/json'
            //         },
            //         body: personalData
            //     })
            //     .then(response => {
            //         if (response.ok) {
            //             console.log('Personal data logged successfully');
            //         } else {
            //             console.error('Failed to log personal data');
            //         }
            //     })
            //     .catch(error => {
            //         console.error('Error logging personal data:', error);
            //     });
            // }
        }
    },
    { urls: ["<all_urls>"] }
);
