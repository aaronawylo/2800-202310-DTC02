console.log('trending.js loaded');
const setup = async () => {
    let testresponse = await axios.get('https://id.twitch.tv/oauth2/token?client_id=culgms7hbkoyqwn37h25ocnd1mwa1c&client_secret=4h5nsk1q8gco3ltiiwoparvr217bmg&grant_type=client_credentials');
    console.log(testresponse);
    console.log('setup() called');
}
// $(document).ready(setup)