export const environment = {
    production: true,
    multiTenant: false,
    COMPANY_NAME: "Maven",
    paid: true,
    authorizedEmails: ['ty.showers@taliferro.tech', 'jerea@maven-inc.com', 'don@maven-inc.com', 'mel@maven-inc.com', 'ty.showers@gmail.com', 'ty.showers@taliferro.com'],
    PLATFORM_URL: "https://maven-nlp.web.app",
    VERSION: require('../../package.json').version,
    firebaseConfig: {
        apiKey: "AIzaSyCQAnM7RAPQyGU_7PCAxFvv_EaNSFb0Yus",
        authDomain: "maven-nlp.firebaseapp.com",
        projectId: "maven-nlp",
        storageBucket: "maven-nlp.appspot.com",
        messagingSenderId: "519400325469",
        appId: "1:519400325469:web:29058a713b3cc3d49728b4",
        measurementId: "G-GG16550C21"
    },
    begin: "BellWeather",
    stripeKey: '',
    stripeTestMode: true, 
    linkPreview: '37bd4a175494ee23afba7d8a117c5f77',
    googleMapsApiKey: 'AIzaSyAb8PrnCpeyihFdvhd-mnM0qkLQ-VSna9M',
    backendURL: 'http://localhost:3000'


};
