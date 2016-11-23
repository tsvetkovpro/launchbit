function getQueryVal(js_file_path, var_name) {
    var scripts = document.getElementsByTagName('script'),
        src_length = 0,
        query_start = 0,
        query_string = "",
        query_array = [],
        query_value = "";
    js_file_regex = new RegExp(js_file_path);
    for(var i = 0, l = scripts.length; i < l; i++){
        if (scripts[i].src.match(js_file_regex)) {
            src_length = scripts[i].src.length;
            query_start = scripts[i].src.indexOf("?");
            query_string = scripts[i].src.substring(query_start + 1,src_length);
            break;
        }
    }
    query_array = query_string.split("&");
    for(var i = 0; i < query_array.length; i++) {
        var tmp = query_array[i].split("=");
        if (tmp[0] == var_name) {
            query_value = tmp[1];
        }
    }

    return query_value;
}

function validURL(url) {
    //not very robust right now
    var url_match = url.match(/^https?:\/\/(.*)/);
    if (url_match && url_match[1]) {
        return 1;
    } else if (url && !url_match) {
        $('input[name="destination_url"]').val("http://" + url);
        return 1;
    } else {
        return 0;
    }
}