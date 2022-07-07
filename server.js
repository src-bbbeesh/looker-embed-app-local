/* Simple Hello World in Node.js */
const crypto = require('crypto');

function nonce(len) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function forceUnicodeEncoding(string) {
    return decodeURIComponent(encodeURIComponent(string));
}

function created_signed_embed_url(options) {
    // looker options
    const secret = options.secret;
    const host = options.host;

    // user options
    const json_external_user_id = JSON.stringify(options.external_user_id);
    const json_first_name = JSON.stringify(options.first_name);
    const json_last_name = JSON.stringify(options.last_name);
    const json_permissions = JSON.stringify(options.permissions);
    const json_models = JSON.stringify(options.models);
    const json_group_ids = JSON.stringify(options.group_ids);
    const json_external_group_id = JSON.stringify(options.external_group_id || "");
    const json_user_attributes = JSON.stringify(options.user_attributes || {});
    const json_access_filters = JSON.stringify(options.access_filters);

    // url/session specific options
    const embed_path = '/login/embed/' + encodeURIComponent(options.embed_url);
    const json_session_length = JSON.stringify(options.session_length);
    const json_force_logout_login = JSON.stringify(options.force_logout_login);

    // computed options
    const json_time = JSON.stringify(Math.floor((new Date()).getTime() / 1000));
    const json_nonce = JSON.stringify(nonce(16));

    // compute signature
    let string_to_sign = "";
    string_to_sign += host + "\n";
    string_to_sign += embed_path + "\n";
    string_to_sign += json_nonce + "\n";
    string_to_sign += json_time + "\n";
    string_to_sign += json_session_length + "\n";
    string_to_sign += json_external_user_id + "\n";
    string_to_sign += json_permissions + "\n";
    string_to_sign += json_models + "\n";
    string_to_sign += json_group_ids + "\n";
    string_to_sign += json_external_group_id + "\n";
    string_to_sign += json_user_attributes + "\n";
    string_to_sign += json_access_filters;

    const signature = crypto.createHmac('sha1', secret).update(forceUnicodeEncoding(string_to_sign)).digest('base64').trim();

    // construct query string
    const query_params = {
        nonce: json_nonce,
        time: json_time,
        session_length: json_session_length,
        external_user_id: json_external_user_id,
        permissions: json_permissions,
        models: json_models,
        access_filters: json_access_filters,
        first_name: json_first_name,
        last_name: json_last_name,
        group_ids: json_group_ids,
        external_group_id: json_external_group_id,
        user_attributes: json_user_attributes,
        force_logout_login: json_force_logout_login,
        signature: signature
    };

    const query_string = new URLSearchParams(query_params).toString();

    return host + embed_path + '?' + query_string;
}

function sample() {
    const duration = 15 * 60;

    const url_data = {
        host: 'searcepartner.cloud.looker.com',
        secret: '10ca01301a1279e6262dde9067cdbb2b2edcb2b120f4f79748ad6329fc640213',
        external_user_id: '',
        first_name: 'Benjamin',
        last_name: 'Beeshma',
        group_ids: [],
        external_group_id: '',
        permissions: ['see_user_dashboards', 'see_lookml_dashboards', 'access_data', 'see_looks', 
        'explore', 'download_with_limit', 'schedule_look_emails', 'create_alerts', 'schedule_external_look_emails', 
        'send_outgoing_webhook', 'send_to_s3', 'send_to_sftp', 'send_to_integration'],
        models: ['thelook_partner'],
        access_filters: {},
        session_length: duration,
        embed_url: "/embed/dashboards-next/60",
        force_logout_login: true
    };

    const url = created_signed_embed_url(url_data);
    return "https://" + url;
}

const url = sample();

console.log('Created url: ' + url); 
const http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("<iframe src='" + url + "' width='100%' height='100%' />");
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');