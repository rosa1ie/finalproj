const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type == "attributes") {
            const responseBody = mutation.target.getAttribute('mydata')
            console.log(responseBody);
        }
    });
});

const dataHolder = document.createElement("div");
const csp_bypass = document.createElement("meta");

document.addEventListener("DOMContentLoaded", function () {
    dataHolder.setAttribute("id", "myDataHolder");
    document.body.appendChild(dataHolder);
});

observer.observe(dataHolder, {
    //configure it to listen to attribute changes
    attributes: true
});
const injectedScript =
    "(" +
    function () {
        console.log("Script Injected");
        // define monkey patch function
        const monkeyPatch = () => {
            let oldXHROpen = window.XMLHttpRequest.prototype.open;
            window.XMLHttpRequest.prototype.open = function () {
                this.addEventListener("load", function () {
                    const responseBody = this.responseText;
                    console.log(`Response Body: ${responseBody}`);
                    document.getElementById('myDataHolder').setAttribute('myData', responseBody)
                });
                return oldXHROpen.apply(this, arguments);
            };
        };
        monkeyPatch();
    } +
    ")();";
var f = new File([injectedScript], "./injectedScript.js", {
    type: "text/javascript",
});
// const injectScript = () => {
//     alert("Injecting Script");

//     var script = document.createElement("script");

//     script.src = f.name;
//     script.nonce = "ABC123"; // This is needed for CSP
//     alert(script.outerHTML);
//     document.head.appendChild(script);
//     script.remove();
// };
// setTimeout(injectScript, 4000);
console.log(
    function () {
        console.log("Script Injected");
        // define monkey patch function
        const monkeyPatch = () => {
            let oldXHROpen = window.XMLHttpRequest.prototype.open;
            window.XMLHttpRequest.prototype.open = function () {
                this.addEventListener("load", function () {
                    const responseBody = this.responseText;
                    console.log(`Response Body: ${responseBody}`);
                    document.getElementById('myDataHolder').setAttribute('myData', responseBody)
                });
                return oldXHROpen.apply(this, arguments);
            };
        };
        monkeyPatch();
    }()
);
