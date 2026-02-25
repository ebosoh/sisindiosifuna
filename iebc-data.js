// ================================================================
// SISI NDIO SIFUNA — Kenya IEBC Administrative Data
// 47 Counties → Constituencies → Wards
// Source: IEBC 2022 General Election data
// ================================================================

const IEBC_DATA = {
  "Mombasa": {
    constituencies: {
      "Changamwe": ["Changamwe", "Kipevu", "Airport", "Port Reitz", "Chaani"],
      "Jomvu": ["Jomvu Kuu", "Miritini", "Mikindani"],
      "Kisauni": ["Mjambere", "Junda", "Bamburi", "Mwakirunge", "Mtopanga", "Magogoni", "Shanzu"],
      "Nyali": ["Frere Town", "Ziwa La Ng'ombe", "Mkomani", "Kongowea", "Kadzandani"],
      "Likoni": ["Mtongwe", "Shika Adabu", "Bofu", "Likoni", "Timbwani"],
      "Mvita": ["Mji Wa Kale/Makadara", "Tudor", "Tononoka", "Shimanzi/Ganjoni", "Majengo"]
    }
  },
  "Kwale": {
    constituencies: {
      "Msambweni": ["Gombato Bongwe", "Ukunda", "Kinondo", "Ramisi"],
      "Lungalunga": ["Pongwe/Kikoneni", "Dzombo", "Mwereni", "Vanga"],
      "Matuga": ["Tsimba Golini", "Waa", "Tiwi", "Kubo South", "Mkongani"],
      "Kinango": ["Ghasi", "Mwaluphamba", "Puma", "Kinango", "Mackinnon Road", "Chengoni/Samburu", "Ndavaya", "Kasemeni"]
    }
  },
  "Kilifi": {
    constituencies: {
      "Kilifi North": ["Tezo", "Sokoni", "Kibarani", "Dabaso", "Matsangoni", "Watamu", "Mnarani"],
      "Kilifi South": ["Chasimba", "Mtepeni"],
      "Kaloleni": ["Mariakani", "Kayafungo", "Kaloleni", "Mwanamwinga"],
      "Rabai": ["Rabai/Kisurutini", "Ruruma", "Kambe/Ribe"],
      "Ganze": ["Ganze", "Bamba", "Jaribuni", "Sokoke"],
      "Malindi": ["Jilore", "Kakuyuni", "Ganda", "Malindi Town", "Shella"],
      "Magarini": ["Marafa", "Magarini", "Gongoni", "Adu", "Garashi", "Sabaki"]
    }
  },
  "Tana River": {
    constituencies: {
      "Garsen": ["Kipini East", "Garsen South", "Kipini West", "Garsen West", "Garsen North", "Garsen East"],
      "Galole": ["Wema", "Wayu", "Chewani", "Mikinduni"],
      "Bura": ["Chewele", "Bura", "Wayu", "Sala", "Nanighi"]
    }
  },
  "Lamu": {
    constituencies: {
      "Lamu East": ["Faza", "Kiunga", "Basuba"],
      "Lamu West": ["Shela", "Mkomani", "Hindi", "Mkunumbi", "Hongwe", "Witu", "Bahari"]
    }
  },
  "Taita Taveta": {
    constituencies: {
      "Taveta": ["Chala", "Mahoo", "Bombo Rvine", "Mata"],
      "Wundanyi": ["Wundanyi/Mbale", "Werugha", "Wumingu/Kishushe", "Mwanda/Mgange"],
      "Mwatate": ["Ronge", "Mwatate", "Bura", "Chawia", "Wusi/Kishamba"],
      "Voi": ["Mbololo", "Sagala", "Kaloleni", "Marungu", "Kasigau", "Ngolia"]
    }
  },
  "Garissa": {
    constituencies: {
      "Garissa Township": ["Waberi", "Galbet", "Township", "Iftin"],
      "Balambala": ["Balambala", "Danyere", "Jarajila", "Bura East", "Saka"],
      "Lagdera": ["Modogashe", "Benane", "Goreale", "Maalimin", "Baraki"],
      "Dadaab": ["Dertu", "Dadaab", "Lagoole", "Abakaile", "Liboi"],
      "Fafi": ["Bura", "Dekaharia", "Jarajila", "Nanighi", "Fafi", "Korakora"],
      "Ijara": ["Ijara", "Masalani", "Phusala", "Sangailu", "Hulugho"]
    }
  },
  "Wajir": {
    constituencies: {
      "Wajir North": ["Gurar", "Bute", "Korondile", "Malkagufu", "Batalu", "Danaba"],
      "Wajir East": ["Wagberi", "Township", "Barwago", "Khorof/Harar"],
      "Tarbaj": ["Tarbaj", "Wargadud", "Sarman", "Elnur/Qoqo"],
      "Wajir West": ["Ganyure/Wagalla", "Hadado/Athibohol", "Benane", "Eldas"],
      "Eldas": ["Eldas", "Della", "Lakoley South/Basir", "Gedamoji"],
      "Wajir South": ["Ademasajida", "Habaswein", "Lagboghol South", "Diif", "Lokumai"]
    }
  },
  "Mandera": {
    constituencies: {
      "Mandera West": ["Takaba South", "Takaba", "Lagsure", "Dandu", "Gither"],
      "Banissa": ["Banissa", "Derkhale", "Gari", "Malkamari", "Kiliwehiri"],
      "Mandera North": ["Ashabito", "Guticha", "Morothile", "Wargudud", "Rhamu", "Rhamu Dimtu"],
      "Mandera South": ["Arabia", "Khalalio", "Neboi", "Township"],
      "Mandera East": ["Elwak North", "Elwak South", "Hareri", "Shimbir Fatuma", "Butiye"],
      "Lafey": ["Lafey", "Fino", "Alango Gof", "Kolqolle", "Warchande"]
    }
  },
  "Marsabit": {
    constituencies: {
      "Moyale": ["Moyale Township", "Butiye", "Sololo", "Golbo"],
      "North Horr": ["Dukana", "Maikona", "Turbi", "North Horr", "Illeret"],
      "Saku": ["Karare", "Marsabit Central", "Sagante/Jaldesa", "Loiyangalani", "Laisamis"],
      "Laisamis": ["Laisamis", "Loiyangalani", "Mount Kulal", "Korr/Ngurunit"]
    }
  },
  "Isiolo": {
    constituencies: {
      "Isiolo North": ["Wabera", "Chari", "Ngare Mara", "Oldonyiro", "Burat"],
      "Isiolo South": ["Garbatulla", "Kinna", "Sericho"]
    }
  },
  "Meru": {
    constituencies: {
      "Igembe South": ["Amwathi", "Akachiu", "Kanuni", "Kiegoi/Antubochiu"],
      "Igembe Central": ["Njia", "Township", "Akimbo", "Antuambui"],
      "Igembe North": ["Antubetwe Kiongo", "Naathu", "Amwathi", "Mutuati"],
      "Tigania West": ["Athiru Gaiti", "Akiverenge", "Ndoloini", "Thangatha", "Mikinduri"],
      "Tigania East": ["Muthara", "Karama", "Kianjai", "Nkomo"],
      "North Imenti": ["Ntima East", "Ntima West", "Nyaki West", "Nyaki East"],
      "Buuri": ["Kisima", "Timau", "Kibirichia", "Buuri"],
      "Central Imenti": ["Meru Central", "Kira", "Ntima East", "Nchiru", "Abothuguchi West"],
      "South Imenti": ["Mitunguu", "Igoji East", "Igoji West", "Abothuguchi East", "Abogeta East", "Abogeta West", "Nkuene"]
    }
  },
  "Tharaka Nithi": {
    constituencies: {
      "Maara": ["Chiakariga", "Mariani", "Kamarinyaga", "Rugara", "Mbogoni", "Nthangairi"],
      "Chuka/Igambang'ombe": ["Tharaka South", "Nkondi", "Chuka", "Igamba Ng'ombe", "Marima"],
      "Tharaka": ["Tharaka North", "Tharaka South", "Gatunga", "Mukothima"]
    }
  },
  "Embu": {
    constituencies: {
      "Manyatta": ["Ruguru/Ngandori", "Kithimu", "Nginda", "Manyatta B", "Mariari"],
      "Runyenjes": ["Gaturi South", "Kagaari South", "Central", "Kagaari North", "Kyeni North", "Kyeni South"],
      "Mbeere South": ["Mbeere South", "Mavuria", "Makima", "Mbeti North"],
      "Mbeere North": ["Evurore", "Kiambere", "Nthawa", "Mwea"]
    }
  },
  "Kitui": {
    constituencies: {
      "Mwingi North": ["Ngomeni", "Kyuso", "Mumoni", "Tseikuru", "Tharaka"],
      "Mwingi West": ["Mwingi Central", "Kivou", "Nguni", "Nuu", "Mui"],
      "Mwingi Central": ["Waita", "Mwingi", "Kyome/Thaana", "Endau/Malalani", "Migwani"],
      "Kitui West": ["Mutonguni", "Kauwi", "Matinyani", "Kwa Mutonga/Kithumula"],
      "Kitui Rural": ["Kisasi", "Mbitini", "Kwavonza/Yatta", "Kanyangi"],
      "Kitui Central": ["Township", "Miambani", "Mulango", "Kyangwithya West", "Kyangwithya East"],
      "Kitui East": ["Zombe/Mwitika", "Chuluni", "Nzambani", "Mutito/Kaliku", "Wikililye"],
      "Kitui South": ["Ikutha", "Kanziko", "Athi", "Mutomo/Kibwea", "Mutha"]
    }
  },
  "Machakos": {
    constituencies: {
      "Masinga": ["Masinga Central", "Ekalakala", "Muthesya", "Ndithini"],
      "Yatta": ["Ndalani", "Matuu", "Kithimani", "Ikombe", "Katangi"],
      "Kangundo": ["Kangundo North", "Kangundo Central", "Kangundo East", "Kangundo West"],
      "Matungulu": ["Tala", "Matungulu North", "Matungulu East", "Matungulu West", "Kalama"],
      "Kathiani": ["Mitaboni", "Kathiani Central", "Upper Kaewa/Iveti", "Lower Kaewa"],
      "Mavoko": ["Athi River", "Kinanie", "Muthwani", "Syokimau/Mulolongo"],
      "Machakos Town": ["Machakos Central", "Mutituni", "Kola", "Kalama", "Mua"],
      "Mwala": ["Mbiuni", "Makaveti/Mwala", "Kibauni", "Wamunyu", "Katheka Kai"]
    }
  },
  "Makueni": {
    constituencies: {
      "Mbooni": ["Tulimani", "Mbooni", "Kithungo/Mutonguni", "Kisau/Kiteta"],
      "Kilome": ["Kasikeu", "Mukaa", "Kiima Kimwe/Kalanzoni"],
      "Kaiti": ["Ukia", "Kee", "Kilungu", "Ilima"],
      "Makueni": ["Wote", "Muvau/Kikumini", "Mavindini", "Kitise/Kithuki", "Kathonzweni", "Nzaui/Kilili/Kalamba"],
      "Kibwezi West": ["Makindu", "Nguumo", "Kikumbulyu North", "Kikumbulyu South", "Nguu/Masumba", "Emali/Mulala"],
      "Kibwezi East": ["Kibwezi", "Masongaleni", "Mtito Andei", "Thange", "Ivingoni/Nzambani"]
    }
  },
  "Nyandarua": {
    constituencies: {
      "Kinangop": ["Githabai", "Ndunyu Njeru", "Gathara", "North Kinangop", "Engineer"],
      "Kipipiri": ["Gatakaini/Kakuzi", "Githioro", "Kandutura", "Kipipiri"],
      "Ol Kalou": ["Karau", "Kanjuiri Ridge", "Mirangine", "Kaimbaga", "Rurii"],
      "Ol Joro Orok": ["Weru", "Charagita", "Leshau", "Pondo", "Shamata"],
      "Ndaragwa": ["Leshau", "Karau", "Shamata", "Ndaragwa", "Githioro"]
    }
  },
  "Nyeri": {
    constituencies: {
      "Tetu": ["Dedan Kimathi", "Wamagana", "Aguthi-Gaaki"],
      "Kieni": ["Mweiga", "Naromoru-Kiamathaga", "Mwiyogo/Endarasha", "Mugunda", "Gatarakwa", "Thegu River", "Kabaru", "Gakawa"],
      "Mathira": ["Ruguru", "Karatina Town", "Mukurweini", "Konyu", "Chinga", "Kagumo-Kakuzi"],
      "Othaya": ["Muhoya", "Karorani", "Chinga", "Magutu", "Iria-ini/Ahiti"],
      "Mukurweini": ["Gikondi", "Rugi", "Mukurweini", "Aguthi"],
      "Nyeri Town": ["Gatitu/Muruguru", "Rware", "Kiganjo/Mathari", "Ruring'u", "Kamakwa/Mukaro"]
    }
  },
  "Kirinyaga": {
    constituencies: {
      "Mwea": ["Mutithi", "Kangai", "Wamumu", "Nyangati", "Murinduko", "Gathigiriri", "Tebere", "Thiba"],
      "Gichugu": ["Kabare", "Baragwi", "Njukiini", "Ngariama", "Kathure"],
      "Ndia": ["Mukure", "Kiburu", "Ndia", "Mururi", "Inoi"],
      "Kirinyaga Central": ["Kerugoya", "Mutira", "Kanyekiini", "Kagio", "Baricho", "Kiine", "Karumandi"]
    }
  },
  "Murang'a": {
    constituencies: {
      "Kangema": ["Rwathia", "Muguru", "Kanyenya-ini", "Gaichanjiru"],
      "Mathioya": ["Gikindu", "Kamacharia", "Mihang'o"],
      "Kiharu": ["Wangu", "Mugoiri", "Mbiri", "Township", "Murarandia", "Gaturi"],
      "Kigumo": ["Kigumo", "Kanderendu", "Cianda", "Kahuro", "Kahumbu"],
      "Maragwa": ["Kimorori/Wempa", "Makuyu", "Kambiti", "Kamahuha", "Ichagaki", "Nginda"],
      "Kandara": ["Ng'araria", "Muruka", "Kagundu-ini", "Gaichanjiru", "Ithiru", "Ruchu"],
      "Gatanga": ["Ithanga", "Kakuzi/Mitubiri", "Mugumo-ini", "Township", "Kariara"]
    }
  },
  "Kiambu": {
    constituencies: {
      "Gatundu South": ["Kiganjo", "Ndarugu", "Ngenda", "Kiganjo", "Gitimbi"],
      "Gatundu North": ["Gituamba", "Githobokoni", "Chania", "Mang'u"],
      "Juja": ["Murera", "Theta", "Juja", "Witeithie", "Kalimoni"],
      "Thika Town": ["Township", "Kamenu", "Gatuanyaga", "Ngoliba"],
      "Ruiru": ["Gitothua", "Biashara", "Gatongora", "Kahawa Sukari", "Kahawa Wendani", "Kiuu", "Mwiki", "Mwihoko"],
      "Githunguri": ["Githunguri", "Githiga", "Ikinu", "Ngewa", "Komothai"],
      "Kiambu": ["Township", "Ndumberi", "Riabai", "Tinganga"],
      "Kiambaa": ["Cianda", "Karuri", "Ndenderu", "Muguga", "Ndeiya", "Kinoo"],
      "Kabete": ["Muguga", "Nihu Gathara", "Kabete", "Uthiru/Ruthimitu", "Gitaru"],
      "Kikuyu": ["Karai", "Nachu", "Sigona", "Kikuyu", "Kinoo"],
      "Limuru": ["Bibirioni", "Limuru Central", "Ndeiya", "Limuru East", "Ngecha/Tigoni"],
      "Lari": ["Kijabe", "Nyanduma", "Kirenga", "Lari/Kirenga", "Kinale"]
    }
  },
  "Turkana": {
    constituencies: {
      "Turkana North": ["Letea", "Songot", "Kalapata", "Namuat"],
      "Turkana West": ["Turkana West", "Lapur", "Kaaleng/Kaikor", "Kibish", "Nakalale"],
      "Turkana Central": ["Kerio Delta", "Farkale", "Township", "Natolia", "Kalokol", "Lodwar Township"],
      "Loima": ["Kotaruk/Lobei", "Turkwel", "Loima", "Lokiriama/Lorengippi"],
      "Turkana South": ["Kaputir", "Katilu", "Lobokat", "Kalapata", "Lokichar"],
      "Turkana East": ["Kapedo/Napeitom", "Kachoda", "Kangata/Suk", "Lokori/Kochodin"]
    }
  },
  "West Pokot": {
    constituencies: {
      "Kapenguria": ["Sook", "Kapenguria", "Mnagei", "Riwo", "Masool"],
      "Sigor": ["Sekerr", "Masool", "Lomut", "Wei Wei"],
      "Kacheliba": ["Kodich", "Kiwawa", "Alale", "Kasei"],
      "Pokot South": ["Chepareria", "Batei", "Lelan", "Sook"]
    }
  },
  "Samburu": {
    constituencies: {
      "Samburu West": ["Suguta Marmar", "Maralal", "Loosuk", "El Barta"],
      "Samburu North": ["Nachola", "Ndoto", "Ngurunit", "Wamba North", "Wamba West", "Wamba East"],
      "Samburu East": ["Isiolo North", "Garba Tula", "Kinna", "Sericho"]
    }
  },
  "Trans Nzoia": {
    constituencies: {
      "Kwanza": ["Kwanza", "Keiyo", "Bidii", "Matisi"],
      "Endebess": ["Endebess", "Metkei", "Central Cherangany/Sipisei", "Motosiet"],
      "Saboti": ["Saboti", "Matumbei", "Kinyoro"],
      "Kiminini": ["Kiminini", "Waitaluk", "St. Joseph", "Sikhendu", "Hospital"],
      "Cherangany": ["Sinyerere", "Makutano", "Kaplamai", "Motosiet", "Cherangany/Suwerwo", "Chepsiro/Kiptoror", "Siron"]
    }
  },
  "Uasin Gishu": {
    constituencies: {
      "Soy": ["Moi's Bridge", "Kipsomba", "Soy", "Kuinet/Kabiyet", "Kaptagat"],
      "Turbo": ["Turbo Town", "Huruma", "Huruka", "Ngeria", "Tapsagoi", "Kamagut"],
      "Moiben": ["Kimumu", "Soy", "Moiben", "Ainabkoi/Olare"],
      "Ainabkoi": ["Ainabkoi/Olare", "Kapsoya", "Kaptagat"],
      "Kapseret": ["Megun", "Simat/Kamukunji", "Kapseret", "Langas"],
      "Kesses": ["Tarakwa", "Ngenyilel", "Tulwet/Chuiyat", "Racecourse"]
    }
  },
  "Elgeyo Marakwet": {
    constituencies: {
      "Marakwet East": ["Kapyego", "Sambirir", "Endo", "Talai"],
      "Marakwet West": ["Lelan", "Sengwer", "Cherang'any/Chebororwa", "Moiben/Kuserwo"],
      "Keiyo North": ["Emsoo", "Kamariny", "Kamwosor", "Kaptarakwa"],
      "Keiyo South": ["Arror", "Metkei", "Soy North", "Kabiemit", "Tambach"]
    }
  },
  "Nandi": {
    constituencies: {
      "Tinderet": ["Songhor/Soba", "Tindiret", "Chemelil/Chemase"],
      "Aldai": ["Kabwareng", "Terik", "Kemeloi-Maraba", "Nandi Hills"],
      "Nandi Hills": ["Nandi Hills", "Chepterwai", "Sugoi", "Kabiyet", "Ndalat"],
      "Chesumei": ["Lelmokwo/Ngechek", "Chemundu/Kapng'etuny", "Koyo/Ndurio", "Kobujoi", "Kaptel/Kamoiywo"],
      "Emgwen": ["Chemase", "Kobujoi", "Kaptel/Kamoiywo", "Kiptuya", "Chepkumia"],
      "Mosop": ["Kapchorwa", "Kabisaga", "Kipkaren", "Kondamet", "Butere", "Ndurio/Koyo"]
    }
  },
  "Baringo": {
    constituencies: {
      "Tiaty": ["Tirioko", "Kolowa", "Ribkwo", "Silale", "Loiyamorock"],
      "Baringo North": ["Baringo North", "Baringo Central", "Saimo/Soi", "Saimo/Kipsaraman"],
      "Baringo Central": ["Kabimoi", "Lembus", "Lembus/Kwen", "Ravine", "Maji Mazuri", "Kisanana"],
      "Baringo South": ["Eldama Ravine", "Lembus/Perkerra", "Lakes", "Marigat", "Ilchamus"],
      "Mogotio": ["Mogotio", "Emining", "Kisanana"],
      "Eldama Ravine": ["Ravine", "Maji Mazuri", "Eldama Ravine", "Koibatek"]
    }
  },
  "Laikipia": {
    constituencies: {
      "Laikipia West": ["Ol Moran", "Rumuruti Township", "Githiga", "Gakoe", "Igwamiti", "Salama"],
      "Laikipia East": ["Ngobit", "Tigithi", "Thingithu", "Nanyuki", "Umande"],
      "Laikipia North": ["Mukogondo East", "Mukogondo West"]
    }
  },
  "Nakuru": {
    constituencies: {
      "Molo": ["Turi", "Molo", "Marioshoni", "Elburgon", "Kipkelion"],
      "Njoro": ["Mau Narok", "Mauche", "Kihingo", "Nessuit", "Lare", "Njoro"],
      "Naivasha": ["Mai Mahiu", "Maai Mahiu", "Naivasha East", "Viwandani", "Hells Gate", "Biashara", "Maui", "Karagoto", "Gilgil", "Elementaita"],
      "Gilgil": ["Elementaita", "Mbaruk/Eburu", "Bahati", "Gilgil", "Molo River"],
      "Kuresoi South": ["Amalo", "Keringet", "Kiptagich", "Tinet"],
      "Kuresoi North": ["Kiplombe", "Kipipiri", "Kamwaura", "Kuresoi North"],
      "Subukia": ["Subukia", "Waseges", "Kabazi"],
      "Rongai": ["Menengai West", "Soin", "Visoi", "Mosop", "Solai"],
      "Bahati": ["Dundori", "Kabazi", "Bahati", "Lanet/Umoja"],
      "Nakuru Town West": ["Barut", "London", "Kaptembwo", "Kapkures", "Rhondha"],
      "Nakuru Town East": ["Flamingo", "Menengai", "Nakuru East", "Biashara"]
    }
  },
  "Narok": {
    constituencies: {
      "Kilgoris": ["Keyian", "Angata Barrikoi", "Shankoe", "Kimintet", "Lolgorian"],
      "Emurua Dikirr": ["Irbaacho", "Mulot", "Ol'Moroti", "Emurua Dikirr"],
      "Narok North": ["Narok Town", "Mara", "Mosiro", "Ilkisonko"],
      "Narok East": ["Olokurto", "Narok East", "Ololulung'a", "Melelo", "Loita"],
      "Narok South": ["Majimoto/Naroosura", "Ololulung'a", "Melelo", "Loita", "Sogoo"],
      "Narok West": ["Ilmotiok", "Mara", "Naikarra"]
    }
  },
  "Kajiado": {
    constituencies: {
      "Kajiado North": ["Purko", "Ongata Rongai", "Ngong", "Oloolua", "Nkoroi"],
      "Kajiado Central": ["Matasia", "Nkaimurunya", "Olkeri", "Kona Baridi"],
      "Kajiado East": ["Kaputiei North", "Kitengela", "Oloosirkon/Sholinke", "Kenyawa/Poka", "Imaroro"],
      "Kajiado West": ["Keekonyokie", "Ilkisusua", "Olchoro/Onyore", "Keekonyokie", "Magadi"],
      "Kajiado South": ["Entasopia", "Loitokitok", "Mbirikani/Eselengei", "Amboseli", "Kimana"]
    }
  },
  "Kericho": {
    constituencies: {
      "Kipkelion East": ["Londiani", "Kedowa/Kimulot", "Chepseon", "Tendeno/Sorget"],
      "Kipkelion West": ["Kipkelion", "Kunyak", "Kipkelion", "Kamasian"],
      "Ainamoi": ["Kipchebor", "Kapkugerwet", "Cheboin", "Kaptembwo"],
      "Bureti": ["Tebesonik", "Chemaner", "Chepchabas", "Koiwa", "Kisiara"],
      "Belgut": ["Kabianga", "Waldai", "Cheptororiet/Seretut", "Chaik", "Kapsuser"],
      "Sigowet/Soin": ["Sigowet", "Kamasian", "Sigor", "Soin"]
    }
  },
  "Bomet": {
    constituencies: {
      "Sotik": ["Ndanai/Abosi", "Chemagel", "Kipreres", "Longisa", "Nyangores"],
      "Chepalungu": ["Kongasis", "Ndaraweta", "Sigor", "Chemaner"],
      "Bomet East": ["Merigi", "Kembu", "Longisa", "Chemaner"],
      "Bomet Central": ["Singorwet", "Chesoen", "Mutarakwa", "Silibwet Township"],
      "Konoin": ["Mogogosiek", "Chebiemit", "Embomos", "Kimulot", "Merigi"]
    }
  },
  "Kakamega": {
    constituencies: {
      "Lugari": ["Lumakanda", "Chekalini", "Chevaywa", "Segero/Bungoma", "Ndivisi"],
      "Likuyani": ["Sango", "Nzoia", "Kongoni", "Sinoko", "Matulo"],
      "Malava": ["Butali/Chegulo", "Manda/Shivanga", "Shirugu/Mugai", "South Kabras"],
      "Lurambi": ["Sheywe", "Mahiakalo", "Shirere", "Butsotso East", "Butsotso South", "Butsotso Central"],
      "Navakholo": ["Ingotse/Mahe", "Namamali", "Musanda", "Chavakali", "Mutsanda"],
      "Mumias West": ["Lusheya/Lubinu", "Malaha/Isongo/Mutsavirwa", "North East Butsotso", "East Butsotso"],
      "Mumias East": ["Mumias", "Etenje", "Musanda"],
      "Matungu": ["Koyonzo", "Kholera", "Khalaba", "Mayoni", "Namamali", "Matungu"],
      "Butere": ["Marama West", "Marama East", "Marama Central", "Marama North"],
      "Khwisero": ["Budumba", "Esibila", "Musanda", "Emakakha"],
      "Shinyalu": ["Isukha South", "Isukha Central", "Isukha North West", "Isukha North", "Manda/Shivanga", "Itibo"],
      "Ikolomani": ["Idakho South", "Idakho East", "Idakho Central", "Idakho North"]
    }
  },
  "Vihiga": {
    constituencies: {
      "Vihiga": ["Lugaga/Wamuluma", "South Maragoli", "Central Maragoli", "Mungoma"],
      "Sabatia": ["Lyaduywa/Izava", "West Sabatia", "Chavakali", "North Maragoli", "Wodanga"],
      "Hamisi": ["Shiru", "Gisambai", "Tambua", "Jepkoyai", "Muhudu", "Shamakhokho"],
      "Luanda": ["Luanda Town", "Wemilabi", "Mwibona", "Luanda South", "Emabungo"],
      "Emuhaya": ["North East Bunyore", "Central Bunyore", "West Bunyore"]
    }
  },
  "Bungoma": {
    constituencies: {
      "Mt. Elgon": ["Cheptais", "Chesikaki", "Chepyuk", "Kapkateny", "Kaptama", "Elgon"],
      "Sirisia": ["Lwandanyi", "Sirisia", "Namwela", "Malakisi/South Kulisiru"],
      "Kabuchai": ["Kabuchai/Chwele", "West Kabuchai", "Naitiri/Kabuyefwe", "Mukuyuni"],
      "Bumula": ["South Bukusu", "Kimaeti", "Bumula", "Khasoko", "Kabula", "Maeni"],
      "Kanduyi": ["Mukuyuni", "Mwibale", "Township", "Bukembe West", "Bukembe East"],
      "Webuye East": ["Ndivisi", "Maraka", "Mihuu", "Sitikho"],
      "Webuye West": ["Matulo", "Maraka", "Sitikho"],
      "Kimilili": ["Kibingei", "Kimilili", "Maeni", "Kamukuywa"],
      "Tongaren": ["Mbakalo", "Naitiri/Kabuyefwe", "Tongaren/Ndalu", "Milima"]
    }
  },
  "Busia": {
    constituencies: {
      "Teso North": ["Malaba Central", "Malaba North", "Ang'urai North", "Ang'urai South", "Ang'urai East", "Malaba South"],
      "Teso South": ["Amukura West", "Amukura East", "Amukura Central", "Chakol South", "Chakol North"],
      "Nambale": ["Bukhayo North/Walatsi", "Bukhayo East", "Bukhayo Central", "Nambale Township"],
      "Matayos": ["South Sakwa", "Bunyala East", "Bunyala West", "Bunyala Central"],
      "Butula": ["Bunyala North", "Elugulu", "Ageng'a Nanguba", "Lunyu", "Budumba"],
      "Funyula": ["Funyula", "Dhiwa", "Nangwe"],
      "Butula": ["Budumba", "Ageng'a Nanguba", "Budalang'i North", "Budalang'i South"]
    }
  },
  "Siaya": {
    constituencies: {
      "Ugenya": ["West Ugenya", "Ugenya", "Ukwala", "North Ugenya"],
      "Ugunja": ["Sigomre", "Ugunja", "Umala", "Sidindi"],
      "Alego Usonga": ["West Asembo", "Central Asembo", "North Asembo", "South Asembo", "Usonga"],
      "Gem": ["Yala Township", "Central Gem", "West Gem", "East Gem", "North Gem", "Sifuyo"],
      "Bondo": ["Bondo Township", "Sauri", "Usigu", "Got Regea", "Nyang'oma", "Yimbo East", "Central Yimbo"],
      "Rarieda": ["West Yimbo", "East Asembo", "South East Rarieda", "North East Rarieda", "South West Rarieda", "North West Rarieda"]
    }
  },
  "Kisumu": {
    constituencies: {
      "Kisumu East": ["Manyatta A", "Kolwa East", "Manyatta B", "Nyalenda A", "Kolwa Central"],
      "Kisumu West": ["South West Kisumu", "Central Kisumu", "Kisumu North", "West Kisumu", "North West Kisumu"],
      "Kisumu Central": ["Railways", "Migosi", "Shaurimoyo-Kaloleni", "Market Milimani", "Kondele", "Nyalenda B"],
      "Seme": ["Central Seme", "West Seme", "East Seme", "North Seme"],
      "Nyando": ["East Kano/Wawidhi", "Awasi/Onjiko", "Ahero", "Kabonyo/Kanyagwal", "Kobito"],
      "Muhoroni": ["Miwani", "Ombeyi", "Masogo/Nyang'oma", "Chemelil", "Muhoroni/Koru"],
      "Nyakach": ["South West Nyakach", "North East Nyakach", "West Nyakach", "Nyando", "South East Nyakach"]
    }
  },
  "Homa Bay": {
    constituencies: {
      "Kasipul": ["West Kasipul", "Central Kasipul", "South Kasipul", "Kasipul"],
      "Kabondo Kasipul": ["East Kamagak", "West Kamagak", "Kokwanyo/Kakrao"],
      "Karachuonyo": ["North Karachuonyo", "West Karachuonyo", "Central Karachuonyo", "Kabonyo/Kanyagwal", "Kibiri", "Sondu"],
      "Rangwe": ["West Gem", "East Gem", "North Gem", "Kochia"],
      "Homa Bay Town": ["Homa Bay Central", "Homa Bay Arujo", "Homa Bay West", "Homa Bay East"],
      "Ndhiwa": ["Kwabwai", "Kanyadoto", "Kanyasa", "North Ndhiwa", "Kagan", "Nyarongi", "Got Matar"],
      "Mbita": ["Kasgunga", "Mfangano Island", "Rusinga Island", "Lambwe", "Gembe"],
      "Suba South": ["Gwassi South", "Gwassi North", "Ruma Kaksingri", "Sindo/Kaksingri West"]
    }
  },
  "Migori": {
    constituencies: {
      "Rongo": ["North Kamagambo", "Central Kamagambo", "South Kamagambo", "East Kamagambo"],
      "Awendo": ["North Sakwa", "South Sakwa", "West Sakwa", "Central Sakwa"],
      "Suna East": ["Suna Central", "Kakrao", "God Jope", "Kwa"],
      "Suna West": ["Wiga", "Wasweta II", "Kakrao", "Suna Central"],
      "Uriri": ["West Kanyamkago", "North Kanyamkago", "Central Kanyamkago", "South Kanyamkago", "East Kanyamkago"],
      "Nyatike": ["Karungu", "Muhuru", "Macalder/Kanyarwanda", "Kaler", "Got Kachola", "Nyatike"],
      "Kuria West": ["Masaba North", "Bukira East", "Bukira Central/Ikerege", "Isibania", "Mabera", "Tagare"],
      "Kuria East": ["Gokeharaka/Getambwega", "Ntimaru West", "Ntimaru East", "Nyamosense/Komosoko"]
    }
  },
  "Kisii": {
    constituencies: {
      "Bonchari": ["Bomariba", "Bogiakumu", "Bomorenda", "Rigoma", "Getenga"],
      "South Mugirango": ["Bogeka", "Nyamarambe", "Boikang'a", "Bombaba Borabu", "Bokeira", "Metembe"],
      "Bomachoge Borabu": ["Bombaba North", "Mashiara", "Matongo", "Kiamokama"],
      "Bobasi": ["Moticho", "Getenga", "Masige West", "Masige East", "Basi Central", "Nyacheki", "Bosoti/Sengera"],
      "Bomachoge Chache": ["Township", "Boochi/Tendere", "Bomariba", "West Mugirango"],
      "Nyaribari Masaba": ["Iranda", "Keumbu", "Kiogoro", "Birongo", "Bokore", "Ichuni"],
      "Nyaribari Chache": ["Kisii Central", "Keumbu", "Kitutu", "Monyerero", "Sensi", "Nyakoe"],
      "Kitutu Chache North": ["Kiamokama", "Kisii", "Bogachiel", "Nyribari"],
      "Kitutu Chache South": ["Ibacho", "Tabaka", "Borangi", "Nyosia"]
    }
  },
  "Nyamira": {
    constituencies: {
      "Kitutu Masaba": ["Rigoma", "Gachuba", "Kemera", "Magombo", "Manga", "Gesima"],
      "West Mugirango": ["Nyamira Township", "Bogacho", "Nyansiongo", "Bosamaro", "Bonyamatuta", "Township"],
      "North Mugirango": ["Bogacho", "Gesima", "Bomorenda"],
      "Borabu": ["Nyansiongo", "Bosamaro", "Biamokama", "Metembe", "Motonto"]
    }
  },
  "Nairobi": {
    constituencies: {
      "Westlands": ["Kitisuru", "Parklands/Highridge", "Karura", "Kangemi", "Mountain View"],
      "Dagoretti North": ["Kilimani", "Kawangware", "Gatina", "Kileleshwa", "Kabiro"],
      "Dagoretti South": ["Mutu-ini", "Ngando", "Riruta", "Uthiru/Ruthimitu", "Waithaka"],
      "Langata": ["Karen", "Nairobi West", "Mugumu-ini", "South C", "Nyayo Highrise"],
      "Kibra": ["Laini Saba", "Lindi", "Makina", "Woodley/Kenyatta Golf Course", "Sarang'ombe"],
      "Roysambu": ["Githurai", "Kahawa West", "Zimmerman", "Roysambu", "Clay City"],
      "Kasarani": ["Clayworks", "Mwiki", "Kasarani", "Njiru", "Ruai"],
      "Ruaraka": ["Baba Dogo", "Utalii", "Mathare North", "Lucky Summer", "Korogocho"],
      "Embakasi South": ["Imara Daima", "Kwa Njenga", "Kwa Reuben", "Pipeline", "Mwanzo"],
      "Embakasi North": ["Kariobangi North", "Dandora Area I", "Dandora Area II", "Dandora Area III", "Dandora Area IV"],
      "Embakasi Central": ["Kayole North", "Kayole South", "Kayole Central", "Chokaa", "Komarock"],
      "Embakasi East": ["Upper Savanna", "Lower Savanna", "Mihango", "Utawala", "Embakasi"],
      "Embakasi West": ["Umoja I", "Umoja II", "Mowlem", "Kariobangi South"],
      "Makadara": ["Maringo/Hamza", "Viwandani", "Harambee", "Makongeni"],
      "Kamukunji": ["Pumwani", "Eastleigh North", "Eastleigh South", "Airbase", "California"],
      "Starehe": ["Nairobi Central", "Ngara", "Pangani", "Ziwani/Kariokor", "Landimawe", "Nairobi South"],
      "Mathare": ["Hospital", "Mabatini", "Huruma", "Ngei", "Mlango Kubwa", "Kiamaiko"]
    }
  }
};

// Build flat county list for dropdown
const COUNTIES = Object.keys(IEBC_DATA).sort();

// Get constituencies for a county
function getConstituencies(county) {
  if (!IEBC_DATA[county]) return [];
  return Object.keys(IEBC_DATA[county].constituencies).sort();
}

// Get wards for a county + constituency
function getWards(county, constituency) {
  if (!IEBC_DATA[county] || !IEBC_DATA[county].constituencies[constituency]) return [];
  return [...IEBC_DATA[county].constituencies[constituency]].sort();
}
