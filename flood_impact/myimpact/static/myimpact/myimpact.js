
// https://docs.djangoproject.com/en/2.0/ref/csrf/#acquiring-the-token-if-csrf-use-sessions-is-false
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


var csrftoken = getCookie('csrftoken');

var form = document.getElementsByTagName('form')[0];
var input = document.getElementById("address-search");
var dataList = document.getElementById('address-list');

form.onsubmit = function(e) {
    e.preventDefault();
    getImpact(input.value);
}

var delayTimer = null;
function delaySearch(text) {

    // clear out the existing datalist
    while (dataList.firstChild) {
        dataList.removeChild(dataList.firstChild)
    }

    clearTimeout(delayTimer);

    delayTimer = setTimeout(function() {

        var post_data = {
            query: form[0].value
        };

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var response = JSON.parse(xhr.response);
                for (var i = 0; i < response.length; i++) {
                    var option = document.createElement('option');
                    option.value = response[i];
                    dataList.appendChild(option);
                }
            }
        }

        xhr.open("POST", "/myimpact/address_search/", true);
        // FIXME: Occasionally document.cookie is an empty string,
        // need to figure out why. Making this view CSRF-exempt in
        // Django for now.
        xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.send(JSON.stringify(post_data));

    }, 1000);
}

function getImpact(address) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var resp = JSON.parse(xhr.response);
            if (resp.success) {
                for (var k in resp.result) {
                    var elem = document.getElementById(k);
                    if (elem) {
                        elem.innerHTML = resp.result[k];
                    }
                }
            }
        }
    }

    xhr.open("GET", "/myimpact/address/" + address + "/", true);
    xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send();

}
