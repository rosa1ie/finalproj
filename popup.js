    document.addEventListener('DOMContentLoaded', function() {
        var loginButton = document.getElementById('login-btn');

        // Check if the user is already logged in
        if (localStorage.getItem('accessToken')) {
            fetchUserData(localStorage.getItem('accessToken'));
            loginButton.textContent = 'Log Out';
        }

        loginButton.addEventListener('click', function() {
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
        }, function(redirectUrl) {
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
        xhr.open('GET', 'https://graph.facebook.com/me?fields=id,name,email,birthday,gender,hometown,location,likes.limit(1).summary(true)&access_token=' + token);
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
        var userName = data.name ? data.name : 'Not Collected';
        var userEmail = data.email ? data.email : 'Not Collected';
        var userLikesCount = data.likes.summary.total_count ? data.likes.summary.total_count : 'Not Collected';
        var userBirthday = data.birthday ? data.birthday : 'Not Collected';
        var userGender = data.gender ? data.gender : 'Not Collected';
        var userHometown = data.hometown ? data.hometown.name : 'Not Collected';
        var userLocation = data.location ? data.location.name : 'Not Collected';

        // Creating a neat display
        var displayContent = `
            <h3>Information Collected by Meta</h3>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Number of Likes:</strong> ${userLikesCount}</p>
            <p><strong>Birthday:</strong> ${userBirthday}</p>
            <p><strong>Gender:</strong> ${userGender}</p>
            <p><strong>Hometown:</strong> ${userHometown}</p>
            <p><strong>Current Location:</strong> ${userLocation}</p>
            <p><strong>Number of Facebook Pages liked Likes:</strong> ${data.likes.summary.total_count}</p>
        `;

        // Setting the innerHTML of the display area
        displayArea.innerHTML = displayContent;
    }

