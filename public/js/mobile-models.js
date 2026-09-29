// ===== World mobile phone models database =====
const MOBILE_BRANDS = {
"Apple": [
"iPhone 2G","iPhone 3G","iPhone 3GS","iPhone 4","iPhone 4S","iPhone 5","iPhone 5c","iPhone 5s",
"iPhone 6","iPhone 6 Plus","iPhone 6s","iPhone 6s Plus","iPhone SE (2016)","iPhone 7","iPhone 7 Plus",
"iPhone 8","iPhone 8 Plus","iPhone X","iPhone XR","iPhone XS","iPhone XS Max",
"iPhone 11","iPhone 11 Pro","iPhone 11 Pro Max","iPhone SE (2020)",
"iPhone 12 mini","iPhone 12","iPhone 12 Pro","iPhone 12 Pro Max",
"iPhone 13 mini","iPhone 13","iPhone 13 Pro","iPhone 13 Pro Max","iPhone SE (2022)",
"iPhone 14","iPhone 14 Plus","iPhone 14 Pro","iPhone 14 Pro Max",
"iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max",
"iPhone 16","iPhone 16 Plus","iPhone 16 Pro","iPhone 16 Pro Max","iPhone 16e",
"iPhone 17","iPhone 17 Pro","iPhone 17 Pro Max","iPhone Air"
],
"Samsung": [
"Galaxy S2","Galaxy S3","Galaxy S4","Galaxy S5","Galaxy S6","Galaxy S6 Edge","Galaxy S7","Galaxy S7 Edge",
"Galaxy S8","Galaxy S8 Plus","Galaxy S9","Galaxy S9 Plus",
"Galaxy S10e","Galaxy S10","Galaxy S10 Plus","Galaxy S10 5G",
"Galaxy S20","Galaxy S20 Plus","Galaxy S20 Ultra","Galaxy S20 FE",
"Galaxy S21","Galaxy S21 Plus","Galaxy S21 Ultra","Galaxy S21 FE",
"Galaxy S22","Galaxy S22 Plus","Galaxy S22 Ultra",
"Galaxy S23","Galaxy S23 Plus","Galaxy S23 Ultra","Galaxy S23 FE",
"Galaxy S24","Galaxy S24 Plus","Galaxy S24 Ultra","Galaxy S24 FE",
"Galaxy S25","Galaxy S25 Plus","Galaxy S25 Ultra","Galaxy S25 FE",
"Galaxy Note 8","Galaxy Note 9","Galaxy Note 10","Galaxy Note 10 Plus","Galaxy Note 20","Galaxy Note 20 Ultra",
"Galaxy Z Fold 2","Galaxy Z Fold 3","Galaxy Z Fold 4","Galaxy Z Fold 5","Galaxy Z Fold 6","Galaxy Z Fold 7",
"Galaxy Z Flip 3","Galaxy Z Flip 4","Galaxy Z Flip 5","Galaxy Z Flip 6","Galaxy Z Flip 7",
"Galaxy A02","Galaxy A03","Galaxy A04","Galaxy A04e","Galaxy A05","Galaxy A06","Galaxy A10","Galaxy A10s",
"Galaxy A11","Galaxy A12","Galaxy A13","Galaxy A14","Galaxy A15","Galaxy A16","Galaxy A20","Galaxy A20s",
"Galaxy A21s","Galaxy A22","Galaxy A23","Galaxy A24","Galaxy A25","Galaxy A26","Galaxy A30","Galaxy A30s",
"Galaxy A31","Galaxy A32","Galaxy A33","Galaxy A34","Galaxy A35","Galaxy A36","Galaxy A50","Galaxy A50s",
"Galaxy A51","Galaxy A52","Galaxy A52s","Galaxy A53","Galaxy A54","Galaxy A55","Galaxy A56","Galaxy A70",
"Galaxy A71","Galaxy A72","Galaxy A73",
"Galaxy M02","Galaxy M11","Galaxy M12","Galaxy M13","Galaxy M14","Galaxy M15","Galaxy M21","Galaxy M31",
"Galaxy M32","Galaxy M33","Galaxy M34","Galaxy M35","Galaxy M51","Galaxy M52",
"Galaxy F02","Galaxy F12","Galaxy F13","Galaxy F14","Galaxy F22","Galaxy F23","Galaxy F34","Galaxy F54",
"Galaxy J2","Galaxy J4","Galaxy J6","Galaxy J7","Galaxy J8","Galaxy Grand Prime"
],
"Xiaomi": [
"Mi 8","Mi 9","Mi 10","Mi 11","Mi 11 Lite","Mi 11 Ultra","Mi 12","Mi 12 Pro","Mi 13","Mi 13 Pro",
"Mi 14","Mi 14 Pro","Mi 14 Ultra","Mi 15","Mi 15 Pro","Mi 15 Ultra",
"Xiaomi 12T","Xiaomi 12T Pro","Xiaomi 13T","Xiaomi 13T Pro","Xiaomi 14T","Xiaomi 14T Pro",
"Xiaomi Civi","Xiaomi Civi 2","Xiaomi Civi 3",
"Mi A1","Mi A2","Mi A3","Mi Note 10","Mi Mix 3","Mi Mix 4"
],
"Redmi": [
"Redmi 7","Redmi 7A","Redmi 8","Redmi 8A","Redmi 9","Redmi 9A","Redmi 9C","Redmi 9T",
"Redmi 10","Redmi 10A","Redmi 10C","Redmi 12","Redmi 12C","Redmi 13","Redmi 13C","Redmi 14C","Redmi 15C",
"Redmi Note 7","Redmi Note 7 Pro","Redmi Note 8","Redmi Note 8 Pro","Redmi Note 9","Redmi Note 9 Pro","Redmi Note 9S",
"Redmi Note 10","Redmi Note 10 Pro","Redmi Note 10S","Redmi Note 11","Redmi Note 11 Pro","Redmi Note 11S",
"Redmi Note 12","Redmi Note 12 Pro","Redmi Note 12S","Redmi Note 13","Redmi Note 13 Pro","Redmi Note 13 Pro Plus",
"Redmi Note 14","Redmi Note 14 Pro","Redmi Note 14 Pro Plus",
"Redmi K20","Redmi K30","Redmi K40","Redmi K50","Redmi K60","Redmi K70","Redmi K80",
"Redmi A1","Redmi A2","Redmi A3","Redmi A4","Redmi A5"
],
"POCO": [
"POCO F1","POCO F2 Pro","POCO F3","POCO F4","POCO F5","POCO F5 Pro","POCO F6","POCO F6 Pro","POCO F7",
"POCO X2","POCO X3","POCO X3 Pro","POCO X3 GT","POCO X4 Pro","POCO X5","POCO X5 Pro","POCO X6","POCO X6 Pro","POCO X7","POCO X7 Pro",
"POCO M2","POCO M3","POCO M4 Pro","POCO M5","POCO M6","POCO M6 Pro","POCO M7",
"POCO C31","POCO C40","POCO C51","POCO C55","POCO C61","POCO C65","POCO C71","POCO C75"
],
"Realme": [
"Realme 5","Realme 5 Pro","Realme 6","Realme 6 Pro","Realme 7","Realme 7 Pro","Realme 8","Realme 8 Pro",
"Realme 9","Realme 9 Pro","Realme 9 Pro Plus","Realme 10","Realme 10 Pro","Realme 10 Pro Plus",
"Realme 11","Realme 11 Pro","Realme 11 Pro Plus","Realme 12","Realme 12 Pro","Realme 12 Pro Plus",
"Realme 13","Realme 13 Pro","Realme 13 Pro Plus","Realme 14","Realme 14 Pro","Realme 14 Pro Plus",
"Realme C11","Realme C12","Realme C15","Realme C17","Realme C21","Realme C25","Realme C30","Realme C31",
"Realme C33","Realme C35","Realme C51","Realme C53","Realme C55","Realme C61","Realme C63","Realme C65","Realme C67","Realme C75",
"Realme GT","Realme GT 2","Realme GT 2 Pro","Realme GT 3","Realme GT 5","Realme GT 6","Realme GT 6T","Realme GT 7",
"Realme Narzo 10","Realme Narzo 20","Realme Narzo 30","Realme Narzo 50","Realme Narzo 60","Realme Narzo 70",
"Realme X","Realme X2","Realme X2 Pro","Realme X3","Realme X7","Realme XT","Realme 3","Realme 3 Pro"
],
"Oppo": [
"Oppo A3s","Oppo A5","Oppo A5s","Oppo A9","Oppo A12","Oppo A15","Oppo A16","Oppo A17","Oppo A18",
"Oppo A31","Oppo A38","Oppo A52","Oppo A53","Oppo A54","Oppo A55","Oppo A57","Oppo A58","Oppo A59","Oppo A60",
"Oppo A74","Oppo A76","Oppo A77","Oppo A78","Oppo A79","Oppo A80","Oppo A95","Oppo A96","Oppo A98",
"Oppo F11","Oppo F11 Pro","Oppo F15","Oppo F17","Oppo F17 Pro","Oppo F19","Oppo F19 Pro","Oppo F21 Pro","Oppo F23","Oppo F25 Pro","Oppo F27 Pro",
"Oppo Reno","Oppo Reno 2","Oppo Reno 3","Reno 4","Oppo Reno 5","Oppo Reno 6","Oppo Reno 7","Oppo Reno 8","Oppo Reno 8T",
"Oppo Reno 10","Oppo Reno 11","Oppo Reno 11 Pro","Oppo Reno 12","Oppo Reno 12 Pro","Oppo Reno 13","Oppo Reno 13 Pro",
"Oppo Find X2","Oppo Find X3","Oppo Find X5","Oppo Find X6","Oppo Find X7","Oppo Find X8","Oppo Find N","Oppo Find N2","Oppo Find N3",
"Oppo K10","Oppo K11","Oppo K12"
],
"Vivo": [
"Vivo Y11","Vivo Y12","Vivo Y12s","Vivo Y15","Vivo Y15s","Vivo Y16","Vivo Y17","Vivo Y17s","Vivo Y19","Vivo Y20",
"Vivo Y21","Vivo Y22","Vivo Y27","Vivo Y28","Vivo Y33s","Vivo Y35","Vivo Y36","Vivo Y51","Vivo Y53s","Vivo Y55","Vivo Y73","Vivo Y100",
"Vivo V15","Vivo V17","Vivo V19","Vivo V20","Vivo V20 SE","Vivo V21","Vivo V21e","Vivo V23","Vivo V23e","Vivo V25","Vivo V25e",
"Vivo V27","Vivo V27e","Vivo V29","Vivo V29e","Vivo V30","Vivo V30e","Vivo V40","Vivo V40e","Vivo V50","Vivo V50e",
"Vivo X50","Vivo X60","Vivo X70","Vivo X80","Vivo X90","Vivo X100","Vivo X100 Pro","Vivo X200","Vivo X200 Pro",
"Vivo S1","Vivo S1 Pro","Vivo T1","Vivo T2","Vivo T3","Vivo iQOO 3","Vivo iQOO 7","Vivo iQOO 9","iQOO 11","iQOO 12","iQOO Neo 6","iQOO Neo 7","iQOO Z6","iQOO Z7","iQOO Z9"
],
"OnePlus": [
"OnePlus 3","OnePlus 3T","OnePlus 5","OnePlus 5T","OnePlus 6","OnePlus 6T",
"OnePlus 7","OnePlus 7 Pro","OnePlus 7T","OnePlus 7T Pro",
"OnePlus 8","OnePlus 8 Pro","OnePlus 8T",
"OnePlus 9","OnePlus 9 Pro","OnePlus 9R","OnePlus 9RT",
"OnePlus 10 Pro","OnePlus 10T",
"OnePlus 11","OnePlus 11R",
"OnePlus 12","OnePlus 12R","OnePlus 13","OnePlus 13R",
"OnePlus Nord","OnePlus Nord 2","OnePlus Nord 2T","OnePlus Nord 3","OnePlus Nord 4",
"OnePlus Nord CE","OnePlus Nord CE 2","OnePlus Nord CE 3","OnePlus Nord CE 4",
"OnePlus Open"
],
"Huawei": [
"Huawei P8","Huawei P9","Huawei P10","Huawei P20","Huawei P20 Pro","Huawei P30","Huawei P30 Pro",
"Huawei P40","Huawei P40 Pro","Huawei P50","Huawei P50 Pro","Huawei P60","Huawei P60 Pro","Huawei Pura 70","Huawei Pura 70 Pro",
"Huawei Mate 10","Huawei Mate 20","Huawei Mate 20 Pro","Huawei Mate 30","Huawei Mate 30 Pro","Huawei Mate 40","Huawei Mate 40 Pro","Huawei Mate 50","Huawei Mate 50 Pro","Huawei Mate 60","Huawei Mate 60 Pro",
"Huawei Nova 3i","Huawei Nova 5T","Huawei Nova 7i","Huawei Nova 8i","Huawei Nova 9","Huawei Nova 9 SE","Huawei Nova 10","Huawei Nova 11","Huawei Nova 12",
"Huawei Y5","Huawei Y6","Huawei Y7","Huawei Y8p","Huawei Y9","Huawei Y9a","Huawei Y9 Prime",
"Huawei Mate X","Huawei Mate Xs","Huawei Mate X3"
],
"Honor": [
"Honor 8X","Honor 9X","Honor 9 Lite","Honor 10 Lite","Honor 20","Honor 50","Honor 50 Lite",
"Honor 70","Honor 90","Honor 90 Lite","Honor 100","Honor 200","Honor 200 Pro","Honor 400","Honor 400 Pro",
"Honor X6","Honor X7","Honor X8","Honor X8a","Honor X9","Honor X9a","Honor X9b","Honor Magic 5","Honor Magic 6","Honor Magic 7",
"Honor View 20"
],
"Google Pixel": [
"Pixel 2","Pixel 2 XL","Pixel 3","Pixel 3 XL","Pixel 3a","Pixel 4","Pixel 4 XL","Pixel 4a","Pixel 4a 5G",
"Pixel 5","Pixel 5a","Pixel 6","Pixel 6 Pro","Pixel 6a",
"Pixel 7","Pixel 7 Pro","Pixel 7a",
"Pixel 8","Pixel 8 Pro","Pixel 8a",
"Pixel 9","Pixel 9 Pro","Pixel 9 Pro XL","Pixel 9a",
"Pixel 10","Pixel 10 Pro","Pixel 10 Pro XL",
"Pixel Fold","Pixel 9 Pro Fold"
],
"Motorola": [
"Moto G4","Moto G5","Moto G6","Moto G7","Moto G8","Moto G9","Moto G10","Moto G20","Moto G30","Moto G40","Moto G50",
"Moto G60","Moto G71","Moto G72","Moto G73","Moto G82","Moto G84","Moto G85","Moto G86",
"Moto E7","Moto E13","Moto E14","Moto E22","Moto E32",
"Moto Edge","Moto Edge 20","Moto Edge 30","Moto Edge 40","Moto Edge 40 Neo","Moto Edge 50","Moto Edge 50 Pro","Moto Edge 50 Fusion",
"Moto Razr","Moto Razr 40","Moto Razr 50"
],
"Nokia": [
"Nokia 2","Nokia 2.4","Nokia 3","Nokia 3.4","Nokia 5","Nokia 5.4","Nokia 6","Nokia 6.1","Nokia 7 Plus",
"Nokia 8","Nokia 8.1","Nokia 8.3","Nokia G10","Nokia G11","Nokia G20","Nokia G21","Nokia G42","Nokia G60",
"Nokia C1","Nokia C2","Nokia C10","Nokia C20","Nokia C21","Nokia C22","Nokia C30","Nokia C31",
"Nokia X10","Nokia X20","Nokia X30","Nokia XR20","Nokia 3310 (2017)","Nokia 105","Nokia 106","Nokia 225"
],
"Infinix": [
"Infinix Hot 8","Infinix Hot 9","Infinix Hot 10","Infinix Hot 10s","Infinix Hot 11","Infinix Hot 11s",
"Infinix Hot 12","Infinix Hot 12i","Infinix Hot 20","Infinix Hot 20i","Infinix Hot 30","Infinix Hot 30i",
"Infinix Hot 40","Infinix Hot 40i","Infinix Hot 40 Pro","Infinix Hot 50","Infinix Hot 50i","Infinix Hot 50 Pro",
"Infinix Note 7","Infinix Note 8","Infinix Note 10","Infinix Note 10 Pro","Infinix Note 11","Infinix Note 11 Pro",
"Infinix Note 12","Infinix Note 12 Pro","Infinix Note 30","Infinix Note 30 Pro","Infinix Note 40","Infinix Note 40 Pro",
"Infinix Smart 5","Infinix Smart 6","Infinix Smart 7","Infinix Smart 8","Infinix Smart 9",
"Infinix Zero 5G","Infinix Zero X Pro","Infinix Zero 20","Infinix Zero 30","Infinix Zero 40",
"Infinix GT 10 Pro","Infinix GT 20 Pro"
],
"Tecno": [
"Tecno Spark 7","Tecno Spark 7 Pro","Tecno Spark 8","Tecno Spark 8C","Tecno Spark 9","Tecno Spark 10","Tecno Spark 10 Pro",
"Tecno Spark 20","Tecno Spark 20 Pro","Tecno Spark Go 2023","Tecno Spark Go 2024",
"Tecno Camon 15","Tecno Camon 16","Tecno Camon 17","Tecno Camon 18","Tecno Camon 19","Tecno Camon 19 Pro",
"Tecno Camon 20","Tecno Camon 20 Pro","Tecno Camon 30","Tecno Camon 30 Pro","Tecno Camon 40",
"Tecno Pova","Tecno Pova 2","Tecno Pova 3","Tecno Pova 4","Tecno Pova 5","Tecno Pova 6",
"Tecno Phantom X","Tecno Phantom X2","Tecno Phantom V Fold",
"Tecno Pop 5","Tecno Pop 6","Tecno Pop 7","Tecno Pop 8"
],
"Itel": [
"Itel A26","Itel A48","Itel A49","Itel A60","Itel A60s","Itel A70",
"Itel S16","Itel S17","Itel S18","Itel S23","Itel S24",
"Itel P36","Itel P37","Itel P38","Itel P40","Itel P55","Itel P65",
"Itel Vision 1","Itel Vision 2","Itel Vision 3"
],
"Sony": [
"Xperia XZ","Xperia XZ1","Xperia XZ2","Xperia XZ3","Xperia 1","Xperia 1 II","Xperia 1 III","Xperia 1 IV","Xperia 1 V","Xperia 1 VI",
"Xperia 5","Xperia 5 II","Xperia 5 III","Xperia 5 IV","Xperia 5 V",
"Xperia 10","Xperia 10 II","Xperia 10 III","Xperia 10 IV","Xperia 10 V","Xperia 10 VI",
"Xperia L4","Xperia Ace III"
],
"Asus": [
"ROG Phone 3","ROG Phone 5","ROG Phone 5s","ROG Phone 6","ROG Phone 6 Pro","ROG Phone 7","ROG Phone 8","ROG Phone 9",
"Zenfone 7","Zenfone 8","Zenfone 9","Zenfone 10","Zenfone 11","Zenfone 12"
],
"Nothing": [
"Nothing Phone (1)","Nothing Phone (2)","Nothing Phone (2a)","Nothing Phone (2a) Plus","Nothing Phone (3)","Nothing Phone (3a)"
],
"Lenovo": [
"Lenovo K5","Lenovo K6","Lenovo K8","Lenovo K10","Lenovo A5","Lenovo A6","Lenovo Legion Phone Duel","Lenovo Legion Phone Duel 2"
],
"LG": [
"LG G6","LG G7","LG G8","LG V30","LG V40","LG V50","LG V60","LG Velvet","LG Wing","LG K42","LG K52","LG K62"
],
"ZTE": [
"ZTE Axon 10","ZTE Axon 20","ZTE Axon 30","ZTE Axon 40","ZTE Blade A31","ZTE Blade A51","ZTE Blade A52","ZTE Blade A71","ZTE Blade V40"
],
"QMobile": [
"QMobile i5i","QMobile i6i","QMobile Noir A1","QMobile Noir i7i","QMobile Noir J7","QMobile Noir S1","QMobile Noir X1",
"QMobile E1","QMobile E2","QMobile E4","QMobile LT250","QMobile S2","QMobile Z10","QMobile Blue 5","QMobile Rocket Lite"
],
"Sparx": [
"Sparx Neo 5","Sparx Neo 6","Sparx Neo 7","Sparx Neo 8","Sparx Neo X","Sparx Ultra 11","Sparx Edge 20"
]
"HTC": [
"HTC One M7","HTC One M8","HTC One M9","HTC 10","HTC U11","HTC U12 Plus","HTC Desire 10","HTC Desire 12","HTC Desire 19","HTC Desire 20","HTC Desire 21","HTC Wildfire","HTC Wildfire E","HTC U20","HTC Exodus"
],
"BlackBerry": [
"BlackBerry Bold 9700","BlackBerry Bold 9780","BlackBerry Curve 8520","BlackBerry Curve 9300","BlackBerry Torch 9800","BlackBerry Z10","BlackBerry Q10","BlackBerry Z30","BlackBerry Passport","BlackBerry Classic","BlackBerry Priv","BlackBerry KeyOne","BlackBerry Key2","BlackBerry Motion"
],
"Meizu": [
"Meizu M5","Meizu M6","Meizu M8","Meizu 16","Meizu 16s","Meizu 17","Meizu 18","Meizu 20","Meizu Note 9","Meizu X8"
],
"Alcatel": [
"Alcatel 1","Alcatel 1B","Alcatel 1S","Alcatel 3","Alcatel 3L","Alcatel 3X","Alcatel 5","Alcatel Pop 4","Alcatel U5","Alcatel Idol 4"
],
"Gionee": [
"Gionee S11","Gionee M7","Gionee A1","Gionee P7","Gionee F103","Gionee Marathon M5","Gionee Elife E8"
],
"Lava": [
"Lava Z2","Lava Z4","Lava Z6","Lava Agni","Lava Agni 2","Lava Blaze","Lava Blaze 2","Lava Yuva","Lava Iris"
],
"Micromax": [
"Micromax Canvas","Micromax Bolt","Micromax Unite","Micromax IN 1","Micromax IN Note 1","Micromax IN 2b","Micromax Canvas Infinity"
],
"Doogee": [
"Doogee S40","Doogee S88","Doogee S96","Doogee N20","Doogee X95","Doogee S61","Doogee V20"
],
"Ulefone": [
"Ulefone Armor 7","Ulefone Armor 8","Ulefone Armor 12","Ulefone Note 14","Ulefone Power Armor 14"
],
"Blackview": [
"Blackview A80","Blackview A100","Blackview BV4900","Blackview BV6300","Blackview BV8800","Blackview Oscal C80"
],
"Cubot": [
"Cubot X19","Cubot P40","Cubot Note 20","Cubot KingKong","Cubot C30","Cubot X50"
],
"Oukitel": [
"Oukitel WP5","Oukitel WP8","Oukitel WP15","Oukitel C21","Oukitel K9","Oukitel WP19"
],
"Dcode": [
"Dcode Cygnal 1","Dcode Cygnal 2","Dcode Bold 2","Dcode Neon"
],
"Vgotel": [
"Vgotel New 5","Vgotel New 7","Vgotel New 9","Vgotel Note 23"
],
"Calme": [
"Calme Spark S11","Calme Spark S22","Calme Hero C5"
],
"XIAOMI Mix": [
"Mi Mix","Mi Mix 2","Mi Mix 2S","Mi Mix 3 5G","Xiaomi Mix 4","Xiaomi Mix Fold","Xiaomi Mix Fold 2","Xiaomi Mix Fold 3"
],
"Red Magic": [
"Red Magic 3","Red Magic 5G","Red Magic 6","Red Magic 7","Red Magic 8 Pro","Red Magic 9 Pro","Red Magic 10 Pro"
],
"ROG Extra": [
"ROG Phone 2","ROG Phone 3 Strix"
],
"Cat": [
"Cat S42","Cat S52","Cat S62","Cat B35","Cat B40"
],
"Energizer": [
"Energizer Power Max P16K","Energizer Ultimate U620S","Energizer Hardcase H591S"
],
"Philips": [
"Philips Xenium E106","Philips E172","Philips S396"
],
"Panasonic": [
"Panasonic Eluga","Panasonic P101","Panasonic Eluga Ray"
],
"Sharp": [
"Sharp Aquos R3","Sharp Aquos R5G","Sharp Aquos Sense 4"
],
"Fujitsu": [
"Fujitsu Arrows 5G","Fujitsu Arrows NX9"
],
"Kyocera": [
"Kyocera DuraForce Pro","Kyocera Brigadier"
]
};
