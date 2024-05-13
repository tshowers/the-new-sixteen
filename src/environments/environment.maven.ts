export const environment = {
    production: true,
    COMPANY_NAME: "Maven",
    paid: false,
    authorizedEmails: ['ty.showers@taliferro.tech', 'jerea@maven-inc.com', 'don@maven-inc.com', 'mel@maven-inc.com'],
    PLATFORM_URL: "https://maven-inc-pa.web.app",
    VERSION: require('../../package.json').version,

    firebaseConfig: {
        apiKey: "AIzaSyAC5LJoOG1hQWS-tHGbsizTnsNGSK7U1Ag",
        authDomain: "maven-inc-pa.firebaseapp.com",
        projectId: "maven-inc-pa",
        storageBucket: "maven-inc-pa.appspot.com",
        messagingSenderId: "823268638819",
        appId: "1:823268638819:web:b35c1a71db5051a39b7856",
        measurementId: "G-7MR812XN3Y"
    }
};
