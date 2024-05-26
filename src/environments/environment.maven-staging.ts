export const environment = {
    production: false,
    multiTenant: false,
    COMPANY_NAME: "Maven",
    paid: true,
    authorizedEmails: ['ty.showers@taliferro.tech', 'jerea@maven-inc.com', 'don@maven-inc.com', 'mel@maven-inc.com', 'ty.showers@gmail.com', 'ty.showers@taliferro.com'],
    PLATFORM_URL: "https://maven-nlp.web.app",
    VERSION: require('../../package.json').version,
    firebaseConfig: {
        apiKey: "AIzaSyAC5LJoOG1hQWS-tHGbsizTnsNGSK7U1Ag",
        authDomain: "maven-inc-pa.firebaseapp.com",
        projectId: "maven-inc-pa",
        storageBucket: "maven-inc-pa.appspot.com",
        messagingSenderId: "823268638819",
        appId: "1:823268638819:web:b35c1a71db5051a39b7856",
        measurementId: "G-7MR812XN3Y"
        },
    begin: "BellWeather",
    stripeKey: '',
    stripeTestMode: true, 
    linkPreview: '37bd4a175494ee23afba7d8a117c5f77',
    googleMapsApiKey: 'AIzaSyAb8PrnCpeyihFdvhd-mnM0qkLQ-VSna9M',
    backendURL: 'http://localhost:3000'


};
