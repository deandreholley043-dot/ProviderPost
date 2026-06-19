export interface ZipLookupResult {
  zip: string
  city: string
  state: string
}

// Comprehensive US zipcode database -- major cities in all 50 states + DC
// Format: [zip, city, stateCode]
const ZIP_DATA: [string, string, string][] = [
  // Alabama
  ["35201", "Birmingham", "AL"], ["35801", "Huntsville", "AL"], ["36101", "Montgomery", "AL"],
  ["36601", "Mobile", "AL"], ["35401", "Tuscaloosa", "AL"], ["36301", "Dothan", "AL"],
  ["35901", "Gadsden", "AL"], ["36801", "Opelika", "AL"], ["35501", "Jasper", "AL"],
  ["35601", "Decatur", "AL"], ["36701", "Selma", "AL"], ["35007", "Alabaster", "AL"],
  ["35071", "Gardendale", "AL"], ["35124", "Pelham", "AL"], ["35244", "Hoover", "AL"],
  // Alaska
  ["99501", "Anchorage", "AK"], ["99701", "Fairbanks", "AK"], ["99801", "Juneau", "AK"],
  ["99901", "Ketchikan", "AK"], ["99611", "Kenai", "AK"], ["99654", "Wasilla", "AK"],
  ["99615", "Kodiak", "AK"], ["99577", "Eagle River", "AK"], ["99503", "Anchorage", "AK"],
  // Arizona
  ["85001", "Phoenix", "AZ"], ["85201", "Mesa", "AZ"], ["85701", "Tucson", "AZ"],
  ["85281", "Tempe", "AZ"], ["85301", "Glendale", "AZ"], ["85251", "Scottsdale", "AZ"],
  ["86001", "Flagstaff", "AZ"], ["85364", "Yuma", "AZ"], ["86301", "Prescott", "AZ"],
  ["85901", "Show Low", "AZ"], ["85501", "Globe", "AZ"], ["86401", "Kingman", "AZ"],
  ["85202", "Mesa", "AZ"], ["85004", "Phoenix", "AZ"], ["85248", "Chandler", "AZ"],
  // Arkansas
  ["72201", "Little Rock", "AR"], ["72701", "Fayetteville", "AR"], ["72901", "Fort Smith", "AR"],
  ["72401", "Jonesboro", "AR"], ["71601", "Pine Bluff", "AR"], ["72032", "Conway", "AR"],
  ["71901", "Hot Springs", "AR"], ["72601", "Harrison", "AR"], ["72801", "Russellville", "AR"],
  ["72301", "West Memphis", "AR"], ["71801", "Hope", "AR"], ["72501", "Batesville", "AR"],
  // California
  ["90001", "Los Angeles", "CA"], ["90210", "Beverly Hills", "CA"], ["94102", "San Francisco", "CA"],
  ["92101", "San Diego", "CA"], ["95814", "Sacramento", "CA"], ["95101", "San Jose", "CA"],
  ["92801", "Anaheim", "CA"], ["93301", "Bakersfield", "CA"], ["94601", "Oakland", "CA"],
  ["92501", "Riverside", "CA"], ["90401", "Santa Monica", "CA"], ["91101", "Pasadena", "CA"],
  ["92701", "Santa Ana", "CA"], ["90802", "Long Beach", "CA"], ["93401", "San Luis Obispo", "CA"],
  ["93901", "Salinas", "CA"], ["96001", "Redding", "CA"], ["95501", "Eureka", "CA"],
  ["93701", "Fresno", "CA"], ["91701", "Rancho Cucamonga", "CA"], ["92602", "Irvine", "CA"],
  ["91301", "Agoura Hills", "CA"], ["94301", "Palo Alto", "CA"], ["90501", "Torrance", "CA"],
  // Colorado
  ["80201", "Denver", "CO"], ["80901", "Colorado Springs", "CO"], ["80301", "Boulder", "CO"],
  ["80521", "Fort Collins", "CO"], ["81001", "Pueblo", "CO"], ["80601", "Brighton", "CO"],
  ["81501", "Grand Junction", "CO"], ["80401", "Golden", "CO"], ["80231", "Denver", "CO"],
  ["81301", "Durango", "CO"], ["80701", "Fort Morgan", "CO"], ["81601", "Glenwood Springs", "CO"],
  // Connecticut
  ["06101", "Hartford", "CT"], ["06501", "New Haven", "CT"], ["06601", "Bridgeport", "CT"],
  ["06901", "Stamford", "CT"], ["06701", "Waterbury", "CT"], ["06301", "Danbury", "CT"],
  ["06401", "Ansonia", "CT"], ["06001", "Avon", "CT"], ["06801", "Bethel", "CT"],
  ["06010", "Bristol", "CT"], ["06040", "Manchester", "CT"], ["06351", "Jewett City", "CT"],
  // Delaware
  ["19901", "Dover", "DE"], ["19801", "Wilmington", "DE"], ["19701", "Bear", "DE"],
  ["19711", "Newark", "DE"], ["19947", "Georgetown", "DE"], ["19904", "Dover", "DE"],
  ["19958", "Lewes", "DE"], ["19720", "New Castle", "DE"], ["19963", "Milford", "DE"],
  // Florida
  ["33101", "Miami", "FL"], ["32801", "Orlando", "FL"], ["33601", "Tampa", "FL"],
  ["32201", "Jacksonville", "FL"], ["33401", "West Palm Beach", "FL"], ["34201", "Bradenton", "FL"],
  ["32301", "Tallahassee", "FL"], ["33901", "Fort Myers", "FL"], ["34601", "Brooksville", "FL"],
  ["32501", "Pensacola", "FL"], ["33301", "Fort Lauderdale", "FL"], ["34101", "Naples", "FL"],
  ["32601", "Gainesville", "FL"], ["34401", "Ocala", "FL"], ["32901", "Melbourne", "FL"],
  ["33701", "St. Petersburg", "FL"], ["33801", "Lakeland", "FL"], ["34741", "Kissimmee", "FL"],
  ["32701", "Altamonte Springs", "FL"], ["33139", "Miami Beach", "FL"], ["33467", "Lake Worth", "FL"],
  // Georgia
  ["30301", "Atlanta", "GA"], ["31201", "Macon", "GA"], ["30901", "Augusta", "GA"],
  ["31401", "Savannah", "GA"], ["30601", "Athens", "GA"], ["31901", "Columbus", "GA"],
  ["30501", "Gainesville", "GA"], ["31601", "Valdosta", "GA"], ["30701", "Calhoun", "GA"],
  ["30101", "Acworth", "GA"], ["30004", "Alpharetta", "GA"], ["30024", "Suwanee", "GA"],
  ["30043", "Lawrenceville", "GA"], ["30060", "Marietta", "GA"], ["30144", "Kennesaw", "GA"],
  // Hawaii
  ["96801", "Honolulu", "HI"], ["96720", "Hilo", "HI"], ["96732", "Kahului", "HI"],
  ["96740", "Kailua Kona", "HI"], ["96734", "Kailua", "HI"], ["96707", "Kapolei", "HI"],
  ["96761", "Lahaina", "HI"], ["96746", "Kapaa", "HI"], ["96786", "Wahiawa", "HI"],
  // Idaho
  ["83701", "Boise", "ID"], ["83201", "Pocatello", "ID"], ["83301", "Twin Falls", "ID"],
  ["83501", "Lewiston", "ID"], ["83401", "Idaho Falls", "ID"], ["83814", "Coeur d'Alene", "ID"],
  ["83601", "Atlanta", "ID"], ["83843", "Moscow", "ID"], ["83651", "Nampa", "ID"],
  ["83686", "Meridian", "ID"], ["83642", "Meridian", "ID"], ["83704", "Boise", "ID"],
  // Illinois
  ["60601", "Chicago", "IL"], ["62701", "Springfield", "IL"], ["61601", "Peoria", "IL"],
  ["61101", "Rockford", "IL"], ["62901", "Carbondale", "IL"], ["60505", "Aurora", "IL"],
  ["60435", "Joliet", "IL"], ["61801", "Urbana", "IL"], ["60115", "DeKalb", "IL"],
  ["60201", "Evanston", "IL"], ["60301", "Oak Park", "IL"], ["60540", "Naperville", "IL"],
  ["60614", "Chicago", "IL"], ["60657", "Chicago", "IL"], ["60091", "Wilmette", "IL"],
  // Indiana
  ["46201", "Indianapolis", "IN"], ["46801", "Fort Wayne", "IN"], ["46601", "South Bend", "IN"],
  ["47201", "Columbus", "IN"], ["47401", "Bloomington", "IN"], ["47901", "Lafayette", "IN"],
  ["46401", "Gary", "IN"], ["47801", "Terre Haute", "IN"], ["47301", "Muncie", "IN"],
  ["46701", "Auburn", "IN"], ["47501", "Washington", "IN"], ["46901", "Kokomo", "IN"],
  // Iowa
  ["50301", "Des Moines", "IA"], ["52401", "Cedar Rapids", "IA"], ["52801", "Davenport", "IA"],
  ["51101", "Sioux City", "IA"], ["50701", "Waterloo", "IA"], ["52001", "Dubuque", "IA"],
  ["52601", "Burlington", "IA"], ["50010", "Ames", "IA"], ["50401", "Mason City", "IA"],
  ["50501", "Fort Dodge", "IA"], ["51501", "Council Bluffs", "IA"], ["50801", "Creston", "IA"],
  // Kansas
  ["67201", "Wichita", "KS"], ["66101", "Kansas City", "KS"], ["66601", "Topeka", "KS"],
  ["67401", "Salina", "KS"], ["66801", "Emporia", "KS"], ["67801", "Dodge City", "KS"],
  ["66701", "Fort Scott", "KS"], ["67501", "Hutchinson", "KS"], ["66002", "Atchison", "KS"],
  ["66901", "Concordia", "KS"], ["67601", "Hays", "KS"], ["67301", "Independence", "KS"],
  // Kentucky
  ["40201", "Louisville", "KY"], ["40501", "Lexington", "KY"], ["41001", "Covington", "KY"],
  ["42001", "Paducah", "KY"], ["42101", "Bowling Green", "KY"], ["42301", "Owensboro", "KY"],
  ["40601", "Frankfort", "KY"], ["40701", "Corbin", "KY"], ["41101", "Ashland", "KY"],
  ["40801", "Baxter", "KY"], ["40901", "Barbourville", "KY"], ["42701", "Elizabethtown", "KY"],
  // Louisiana
  ["70112", "New Orleans", "LA"], ["70801", "Baton Rouge", "LA"], ["71101", "Shreveport", "LA"],
  ["70501", "Lafayette", "LA"], ["71201", "Monroe", "LA"], ["70601", "Lake Charles", "LA"],
  ["70301", "Thibodaux", "LA"], ["70401", "Hammond", "LA"], ["71301", "Alexandria", "LA"],
  ["71457", "Natchitoches", "LA"], ["70560", "New Iberia", "LA"], ["70001", "Metairie", "LA"],
  // Maine
  ["04101", "Portland", "ME"], ["04401", "Bangor", "ME"], ["04330", "Augusta", "ME"],
  ["04240", "Lewiston", "ME"], ["04901", "Waterville", "ME"], ["04841", "Rockland", "ME"],
  ["04609", "Bar Harbor", "ME"], ["04210", "Auburn", "ME"], ["04530", "Bath", "ME"],
  ["04011", "Brunswick", "ME"], ["04769", "Presque Isle", "ME"], ["04605", "Ellsworth", "ME"],
  // Maryland
  ["21201", "Baltimore", "MD"], ["20901", "Silver Spring", "MD"], ["20850", "Rockville", "MD"],
  ["21401", "Annapolis", "MD"], ["21701", "Frederick", "MD"], ["21801", "Salisbury", "MD"],
  ["20601", "Waldorf", "MD"], ["20901", "Silver Spring", "MD"], ["21228", "Catonsville", "MD"],
  ["20706", "Lanham", "MD"], ["21044", "Columbia", "MD"], ["20740", "College Park", "MD"],
  // Massachusetts
  ["02101", "Boston", "MA"], ["01101", "Springfield", "MA"], ["01601", "Worcester", "MA"],
  ["02301", "Brockton", "MA"], ["01201", "Pittsfield", "MA"], ["02601", "Hyannis", "MA"],
  ["01701", "Framingham", "MA"], ["02138", "Cambridge", "MA"], ["01301", "Greenfield", "MA"],
  ["01801", "Woburn", "MA"], ["02401", "Brockton", "MA"], ["01901", "Lynn", "MA"],
  ["02139", "Cambridge", "MA"], ["02215", "Boston", "MA"], ["01002", "Amherst", "MA"],
  // Michigan
  ["48201", "Detroit", "MI"], ["49501", "Grand Rapids", "MI"], ["48933", "Lansing", "MI"],
  ["49001", "Kalamazoo", "MI"], ["48601", "Saginaw", "MI"], ["48101", "Allen Park", "MI"],
  ["48503", "Flint", "MI"], ["49801", "Iron Mountain", "MI"], ["48301", "Bloomfield Hills", "MI"],
  ["49684", "Traverse City", "MI"], ["48060", "Port Huron", "MI"], ["48801", "Alma", "MI"],
  ["48104", "Ann Arbor", "MI"], ["48823", "East Lansing", "MI"], ["49401", "Allendale", "MI"],
  // Minnesota
  ["55401", "Minneapolis", "MN"], ["55101", "Saint Paul", "MN"], ["55801", "Duluth", "MN"],
  ["56001", "Mankato", "MN"], ["56301", "Saint Cloud", "MN"], ["55901", "Rochester", "MN"],
  ["56401", "Brainerd", "MN"], ["56501", "Detroit Lakes", "MN"], ["56601", "Bemidji", "MN"],
  ["55060", "Owatonna", "MN"], ["56201", "Willmar", "MN"], ["55301", "Anoka", "MN"],
  // Mississippi
  ["39201", "Jackson", "MS"], ["39501", "Gulfport", "MS"], ["39301", "Meridian", "MS"],
  ["38801", "Tupelo", "MS"], ["39401", "Hattiesburg", "MS"], ["38601", "Batesville", "MS"],
  ["39701", "Columbus", "MS"], ["38701", "Greenville", "MS"], ["39601", "Laurel", "MS"],
  ["39120", "Natchez", "MS"], ["38901", "Grenada", "MS"], ["39157", "Ridgeland", "MS"],
  // Missouri
  ["63101", "Saint Louis", "MO"], ["64101", "Kansas City", "MO"], ["65801", "Springfield", "MO"],
  ["65201", "Columbia", "MO"], ["65101", "Jefferson City", "MO"], ["63701", "Cape Girardeau", "MO"],
  ["64801", "Joplin", "MO"], ["65401", "Rolla", "MO"], ["63301", "Saint Charles", "MO"],
  ["64501", "Saint Joseph", "MO"], ["65601", "Ash Grove", "MO"], ["63601", "Park Hills", "MO"],
  // Montana
  ["59601", "Helena", "MT"], ["59101", "Billings", "MT"], ["59801", "Missoula", "MT"],
  ["59401", "Great Falls", "MT"], ["59701", "Butte", "MT"], ["59901", "Kalispell", "MT"],
  ["59301", "Miles City", "MT"], ["59201", "Wolf Point", "MT"], ["59501", "Havre", "MT"],
  // Nebraska
  ["68101", "Omaha", "NE"], ["68501", "Lincoln", "NE"], ["68801", "Grand Island", "NE"],
  ["69101", "North Platte", "NE"], ["68601", "Columbus", "NE"], ["68701", "Norfolk", "NE"],
  ["68301", "Auburn", "NE"], ["68901", "Hastings", "NE"], ["68401", "Beatrice", "NE"],
  ["69001", "McCook", "NE"], ["68847", "Kearney", "NE"], ["68025", "Fremont", "NE"],
  // Nevada
  ["89101", "Las Vegas", "NV"], ["89501", "Reno", "NV"], ["89701", "Carson City", "NV"],
  ["89301", "Ely", "NV"], ["89801", "Elko", "NV"], ["89015", "Henderson", "NV"],
  ["89431", "Sparks", "NV"], ["89406", "Fallon", "NV"], ["89703", "Carson City", "NV"],
  ["89002", "Henderson", "NV"], ["89044", "Henderson", "NV"], ["89052", "Henderson", "NV"],
  // New Hampshire
  ["03101", "Manchester", "NH"], ["03301", "Concord", "NH"], ["03801", "Portsmouth", "NH"],
  ["03060", "Nashua", "NH"], ["03431", "Keene", "NH"], ["03755", "Hanover", "NH"],
  ["03601", "Acworth", "NH"], ["03246", "Laconia", "NH"], ["03570", "Berlin", "NH"],
  ["03766", "Lebanon", "NH"], ["03801", "Portsmouth", "NH"], ["03038", "Derry", "NH"],
  // New Jersey
  ["07101", "Newark", "NJ"], ["08601", "Trenton", "NJ"], ["07302", "Jersey City", "NJ"],
  ["08501", "Allentown", "NJ"], ["08401", "Atlantic City", "NJ"], ["07001", "Avenel", "NJ"],
  ["07801", "Dover", "NJ"], ["08901", "New Brunswick", "NJ"], ["08701", "Lakewood", "NJ"],
  ["07060", "Plainfield", "NJ"], ["07701", "Red Bank", "NJ"], ["07030", "Hoboken", "NJ"],
  ["08801", "Annandale", "NJ"], ["07901", "Summit", "NJ"], ["07202", "Elizabeth", "NJ"],
  // New Mexico
  ["87101", "Albuquerque", "NM"], ["88001", "Las Cruces", "NM"], ["87501", "Santa Fe", "NM"],
  ["88201", "Roswell", "NM"], ["87301", "Gallup", "NM"], ["87401", "Farmington", "NM"],
  ["88101", "Clovis", "NM"], ["87701", "Las Vegas", "NM"], ["88301", "Carrizozo", "NM"],
  ["87801", "Socorro", "NM"], ["88401", "Tucumcari", "NM"], ["87901", "Truth or Consequences", "NM"],
  // New York
  ["10001", "New York", "NY"], ["10301", "Staten Island", "NY"], ["11201", "Brooklyn", "NY"],
  ["10451", "Bronx", "NY"], ["11101", "Long Island City", "NY"], ["12201", "Albany", "NY"],
  ["14201", "Buffalo", "NY"], ["13201", "Syracuse", "NY"], ["14601", "Rochester", "NY"],
  ["10901", "Suffern", "NY"], ["10601", "White Plains", "NY"], ["11501", "Mineola", "NY"],
  ["12601", "Poughkeepsie", "NY"], ["13601", "Watertown", "NY"], ["14850", "Ithaca", "NY"],
  ["12801", "Glens Falls", "NY"], ["10701", "Yonkers", "NY"], ["11901", "Riverhead", "NY"],
  // North Carolina
  ["27601", "Raleigh", "NC"], ["28201", "Charlotte", "NC"], ["27401", "Greensboro", "NC"],
  ["27701", "Durham", "NC"], ["27101", "Winston-Salem", "NC"], ["28801", "Asheville", "NC"],
  ["28401", "Wilmington", "NC"], ["28601", "Hickory", "NC"], ["28301", "Fayetteville", "NC"],
  ["27501", "Sanford", "NC"], ["28001", "Albemarle", "NC"], ["27858", "Greenville", "NC"],
  ["27330", "Sanford", "NC"], ["28501", "Kinston", "NC"], ["28701", "Arden", "NC"],
  // North Dakota
  ["58501", "Bismarck", "ND"], ["58102", "Fargo", "ND"], ["58201", "Grand Forks", "ND"],
  ["58701", "Minot", "ND"], ["58601", "Jamestown", "ND"], ["58801", "Williston", "ND"],
  ["58301", "Devils Lake", "ND"], ["58401", "Valley City", "ND"], ["58078", "West Fargo", "ND"],
  // Ohio
  ["43201", "Columbus", "OH"], ["44101", "Cleveland", "OH"], ["45201", "Cincinnati", "OH"],
  ["43601", "Toledo", "OH"], ["44301", "Akron", "OH"], ["45401", "Dayton", "OH"],
  ["44501", "Youngstown", "OH"], ["44701", "Canton", "OH"], ["43081", "Westerville", "OH"],
  ["44001", "Amherst", "OH"], ["45601", "Chillicothe", "OH"], ["45701", "Athens", "OH"],
  ["44601", "Alliance", "OH"], ["43701", "Zanesville", "OH"], ["44801", "Bellevue", "OH"],
  // Oklahoma
  ["73101", "Oklahoma City", "OK"], ["74101", "Tulsa", "OK"], ["73401", "Ardmore", "OK"],
  ["73501", "Lawton", "OK"], ["74401", "Muskogee", "OK"], ["74801", "Shawnee", "OK"],
  ["73701", "Enid", "OK"], ["74601", "Ponca City", "OK"], ["73301", "Austin", "OK"],
  ["73601", "Clinton", "OK"], ["74301", "Vinita", "OK"], ["73801", "Woodward", "OK"],
  // Oregon
  ["97201", "Portland", "OR"], ["97301", "Salem", "OR"], ["97401", "Eugene", "OR"],
  ["97501", "Medford", "OR"], ["97701", "Bend", "OR"], ["97801", "Pendleton", "OR"],
  ["97601", "Klamath Falls", "OR"], ["97101", "Amity", "OR"], ["97030", "Gresham", "OR"],
  ["97005", "Beaverton", "OR"], ["97301", "Salem", "OR"], ["97901", "Adrian", "OR"],
  ["97520", "Ashland", "OR"], ["97330", "Corvallis", "OR"], ["97478", "Springfield", "OR"],
  // Pennsylvania
  ["19101", "Philadelphia", "PA"], ["15201", "Pittsburgh", "PA"], ["17101", "Harrisburg", "PA"],
  ["18101", "Allentown", "PA"], ["16501", "Erie", "PA"], ["18501", "Scranton", "PA"],
  ["19601", "Reading", "PA"], ["17601", "Lancaster", "PA"], ["15901", "Johnstown", "PA"],
  ["16801", "State College", "PA"], ["17401", "York", "PA"], ["18201", "Hazleton", "PA"],
  ["19301", "Paoli", "PA"], ["18701", "Wilkes-Barre", "PA"], ["17701", "Williamsport", "PA"],
  // Rhode Island
  ["02901", "Providence", "RI"], ["02840", "Newport", "RI"], ["02860", "Pawtucket", "RI"],
  ["02806", "Barrington", "RI"], ["02886", "Warwick", "RI"], ["02891", "Westerly", "RI"],
  ["02816", "Coventry", "RI"], ["02864", "Cumberland", "RI"], ["02818", "East Greenwich", "RI"],
  // South Carolina
  ["29201", "Columbia", "SC"], ["29401", "Charleston", "SC"], ["29601", "Greenville", "SC"],
  ["29801", "Aiken", "SC"], ["29501", "Florence", "SC"], ["29301", "Spartanburg", "SC"],
  ["29901", "Beaufort", "SC"], ["29101", "McBee", "SC"], ["29706", "Chester", "SC"],
  ["29440", "Georgetown", "SC"], ["29572", "Myrtle Beach", "SC"], ["29649", "Greenwood", "SC"],
  // South Dakota
  ["57101", "Sioux Falls", "SD"], ["57701", "Rapid City", "SD"], ["57401", "Aberdeen", "SD"],
  ["57301", "Mitchell", "SD"], ["57501", "Pierre", "SD"], ["57201", "Watertown", "SD"],
  ["57601", "Mobridge", "SD"], ["57350", "Huron", "SD"], ["57078", "Yankton", "SD"],
  // Tennessee
  ["37201", "Nashville", "TN"], ["38101", "Brownsville", "TN"], ["37901", "Knoxville", "TN"],
  ["37401", "Chattanooga", "TN"], ["38301", "Jackson", "TN"], ["37601", "Johnson City", "TN"],
  ["38501", "Cookeville", "TN"], ["37801", "Maryville", "TN"], ["38401", "Columbia", "TN"],
  ["37701", "Alcoa", "TN"], ["37501", "Chattanooga", "TN"], ["38103", "Memphis", "TN"],
  ["37027", "Brentwood", "TN"], ["37064", "Franklin", "TN"], ["37129", "Murfreesboro", "TN"],
  // Texas
  ["73301", "Austin", "TX"], ["75201", "Dallas", "TX"], ["77001", "Houston", "TX"],
  ["78201", "San Antonio", "TX"], ["76101", "Fort Worth", "TX"], ["79901", "El Paso", "TX"],
  ["78401", "Corpus Christi", "TX"], ["79601", "Abilene", "TX"], ["76301", "Wichita Falls", "TX"],
  ["75001", "Addison", "TX"], ["77301", "Conroe", "TX"], ["75901", "Lufkin", "TX"],
  ["79101", "Amarillo", "TX"], ["76501", "Temple", "TX"], ["78501", "McAllen", "TX"],
  ["75401", "Greenville", "TX"], ["77701", "Beaumont", "TX"], ["76801", "Brownwood", "TX"],
  ["78701", "Austin", "TX"], ["75024", "Plano", "TX"], ["75050", "Grand Prairie", "TX"],
  ["75060", "Irving", "TX"], ["76010", "Arlington", "TX"], ["75040", "Garland", "TX"],
  // Utah
  ["84101", "Salt Lake City", "UT"], ["84601", "Provo", "UT"], ["84401", "Ogden", "UT"],
  ["84701", "Richfield", "UT"], ["84301", "Brigham City", "UT"], ["84501", "Price", "UT"],
  ["84770", "St George", "UT"], ["84057", "Orem", "UT"], ["84321", "Logan", "UT"],
  ["84003", "American Fork", "UT"], ["84010", "Bountiful", "UT"], ["84660", "Spanish Fork", "UT"],
  // Vermont
  ["05401", "Burlington", "VT"], ["05601", "Montpelier", "VT"], ["05701", "Rutland", "VT"],
  ["05301", "Brattleboro", "VT"], ["05201", "Bennington", "VT"], ["05101", "Bellows Falls", "VT"],
  ["05001", "White River Junction", "VT"], ["05501", "Andover", "VT"], ["05801", "Saint Johnsbury", "VT"],
  // Virginia
  ["23218", "Richmond", "VA"], ["23501", "Norfolk", "VA"], ["22301", "Alexandria", "VA"],
  ["20101", "Dulles", "VA"], ["24001", "Roanoke", "VA"], ["22901", "Charlottesville", "VA"],
  ["23601", "Newport News", "VA"], ["24501", "Lynchburg", "VA"], ["22401", "Fredericksburg", "VA"],
  ["23801", "Fort Barfoot", "VA"], ["22801", "Harrisonburg", "VA"], ["23701", "Portsmouth", "VA"],
  ["20190", "Reston", "VA"], ["22101", "McLean", "VA"], ["22030", "Fairfax", "VA"],
  // Washington
  ["98101", "Seattle", "WA"], ["99201", "Spokane", "WA"], ["98401", "Tacoma", "WA"],
  ["98801", "Wenatchee", "WA"], ["98501", "Olympia", "WA"], ["99301", "Pasco", "WA"],
  ["98001", "Auburn", "WA"], ["98201", "Everett", "WA"], ["99401", "Asotin", "WA"],
  ["98601", "Amboy", "WA"], ["98901", "Yakima", "WA"], ["98661", "Vancouver", "WA"],
  ["98003", "Federal Way", "WA"], ["98033", "Kirkland", "WA"], ["98052", "Redmond", "WA"],
  // West Virginia
  ["25301", "Charleston", "WV"], ["26501", "Morgantown", "WV"], ["25401", "Martinsburg", "WV"],
  ["26003", "Wheeling", "WV"], ["25701", "Huntington", "WV"], ["26101", "Parkersburg", "WV"],
  ["26301", "Clarksburg", "WV"], ["25801", "Beckley", "WV"], ["25601", "Logan", "WV"],
  ["26201", "Buckhannon", "WV"], ["25901", "Fayetteville", "WV"], ["26701", "Parsons", "WV"],
  // Wisconsin
  ["53201", "Milwaukee", "WI"], ["53701", "Madison", "WI"], ["54301", "Green Bay", "WI"],
  ["54601", "La Crosse", "WI"], ["53081", "Sheboygan", "WI"], ["54901", "Oshkosh", "WI"],
  ["53401", "Racine", "WI"], ["53501", "Beloit", "WI"], ["54401", "Wausau", "WI"],
  ["53801", "Bagley", "WI"], ["54501", "Rhinelander", "WI"], ["53901", "Portage", "WI"],
  ["53202", "Milwaukee", "WI"], ["53703", "Madison", "WI"], ["53511", "Beloit", "WI"],
  // Wyoming
  ["82001", "Cheyenne", "WY"], ["82601", "Casper", "WY"], ["82070", "Laramie", "WY"],
  ["82901", "Rock Springs", "WY"], ["82501", "Riverton", "WY"], ["82401", "Worland", "WY"],
  ["82801", "Sheridan", "WY"], ["82301", "Rawlins", "WY"], ["82201", "Torrington", "WY"],
  // DC
  ["20001", "Washington", "DC"], ["20002", "Washington", "DC"], ["20003", "Washington", "DC"],
  ["20004", "Washington", "DC"], ["20005", "Washington", "DC"], ["20006", "Washington", "DC"],
  ["20007", "Washington", "DC"], ["20008", "Washington", "DC"], ["20009", "Washington", "DC"],
  ["20010", "Washington", "DC"], ["20011", "Washington", "DC"], ["20012", "Washington", "DC"],

  // ── Canadian Provinces ────────────────────────────────────────────────────
  // Alberta (AB)
  ["T2P", "Calgary", "AB"], ["T2R", "Calgary", "AB"], ["T2S", "Calgary", "AB"],
  ["T2T", "Calgary", "AB"], ["T2G", "Calgary", "AB"], ["T2H", "Calgary", "AB"],
  ["T5H", "Edmonton", "AB"], ["T5J", "Edmonton", "AB"], ["T5K", "Edmonton", "AB"],
  ["T5L", "Edmonton", "AB"], ["T5M", "Edmonton", "AB"], ["T5N", "Edmonton", "AB"],
  ["T4N", "Red Deer", "AB"], ["T4P", "Red Deer", "AB"], ["T4Q", "Red Deer", "AB"],
  ["T1S", "Lethbridge", "AB"], ["T1J", "Lethbridge", "AB"], ["T1K", "Lethbridge", "AB"],
  ["T8N", "Fort McMurray", "AB"], ["T9H", "Fort McMurray", "AB"],
  ["T8V", "Grande Prairie", "AB"], ["T8W", "Grande Prairie", "AB"],
  ["T4T", "Medicine Hat", "AB"], ["T1A", "Medicine Hat", "AB"],
  ["T8H", "Sherwood Park", "AB"], ["T8A", "Sherwood Park", "AB"],

  // British Columbia (BC)
  ["V5K", "Vancouver", "BC"], ["V5L", "Vancouver", "BC"], ["V5M", "Vancouver", "BC"],
  ["V5N", "Vancouver", "BC"], ["V5P", "Vancouver", "BC"], ["V5R", "Vancouver", "BC"],
  ["V6A", "Vancouver", "BC"], ["V6B", "Vancouver", "BC"], ["V6C", "Vancouver", "BC"],
  ["V6E", "Vancouver", "BC"], ["V6G", "Vancouver", "BC"], ["V6H", "Vancouver", "BC"],
  ["V3C", "Surrey", "BC"], ["V3R", "Surrey", "BC"], ["V3S", "Surrey", "BC"],
  ["V3T", "Surrey", "BC"], ["V4A", "Surrey", "BC"],
  ["V2L", "Prince George", "BC"], ["V2M", "Prince George", "BC"],
  ["V8R", "Victoria", "BC"], ["V8S", "Victoria", "BC"], ["V8T", "Victoria", "BC"],
  ["V8V", "Victoria", "BC"], ["V8W", "Victoria", "BC"], ["V8X", "Victoria", "BC"],
  ["V1Y", "Kelowna", "BC"], ["V1X", "Kelowna", "BC"], ["V1W", "Kelowna", "BC"],
  ["V2C", "Kamloops", "BC"], ["V2B", "Kamloops", "BC"], ["V2E", "Kamloops", "BC"],
  ["V2G", "Abbotsford", "BC"], ["V2S", "Abbotsford", "BC"], ["V2T", "Abbotsford", "BC"],
  ["V3G", "Abbotsford", "BC"],
  ["V3J", "Burnaby", "BC"], ["V3N", "Burnaby", "BC"], ["V5A", "Burnaby", "BC"],
  ["V5B", "Burnaby", "BC"], ["V5C", "Burnaby", "BC"], ["V5E", "Burnaby", "BC"],
  ["V7M", "North Vancouver", "BC"], ["V7N", "North Vancouver", "BC"], ["V7P", "North Vancouver", "BC"],
  ["V7L", "North Vancouver", "BC"],

  // Manitoba (MB)
  ["R2C", "Winnipeg", "MB"], ["R2H", "Winnipeg", "MB"], ["R2J", "Winnipeg", "MB"],
  ["R2K", "Winnipeg", "MB"], ["R2L", "Winnipeg", "MB"], ["R2M", "Winnipeg", "MB"],
  ["R3A", "Winnipeg", "MB"], ["R3B", "Winnipeg", "MB"], ["R3C", "Winnipeg", "MB"],
  ["R3G", "Winnipeg", "MB"], ["R3H", "Winnipeg", "MB"],
  ["R7A", "Brandon", "MB"], ["R7B", "Brandon", "MB"], ["R7C", "Brandon", "MB"],
  ["R6W", "Portage la Prairie", "MB"],

  // New Brunswick (NB)
  ["E3A", "Fredericton", "NB"], ["E3B", "Fredericton", "NB"], ["E3C", "Fredericton", "NB"],
  ["E2L", "Saint John", "NB"], ["E2M", "Saint John", "NB"], ["E2N", "Saint John", "NB"],
  ["E1C", "Moncton", "NB"], ["E1E", "Moncton", "NB"], ["E1G", "Moncton", "NB"],

  // Newfoundland and Labrador (NL)
  ["A1A", "St. John's", "NL"], ["A1B", "St. John's", "NL"], ["A1C", "St. John's", "NL"],
  ["A1E", "St. John's", "NL"], ["A1G", "St. John's", "NL"],
  ["A2H", "Corner Brook", "NL"], ["A2V", "Corner Brook", "NL"],
  ["A0G", "Gander", "NL"],

  // Nova Scotia (NS)
  ["B3H", "Halifax", "NS"], ["B3J", "Halifax", "NS"], ["B3K", "Halifax", "NS"],
  ["B3L", "Halifax", "NS"], ["B3M", "Halifax", "NS"], ["B3N", "Halifax", "NS"],
  ["B3P", "Halifax", "NS"], ["B3R", "Halifax", "NS"],
  ["B2A", "Sydney", "NS"], ["B1P", "Sydney", "NS"],
  ["B4N", "Truro", "NS"], ["B2N", "Truro", "NS"],

  // Northwest Territories (NT)
  ["X1A", "Yellowknife", "NT"], ["X0B", "Yellowknife", "NT"],

  // Nunavut (NU)
  ["X0A", "Iqaluit", "NU"], ["X0C", "Rankin Inlet", "NU"],

  // Ontario (ON)
  ["M4B", "Toronto", "ON"], ["M4C", "Toronto", "ON"], ["M4E", "Toronto", "ON"],
  ["M5A", "Toronto", "ON"], ["M5B", "Toronto", "ON"], ["M5C", "Toronto", "ON"],
  ["M5E", "Toronto", "ON"], ["M5G", "Toronto", "ON"], ["M5H", "Toronto", "ON"],
  ["M5J", "Toronto", "ON"], ["M5K", "Toronto", "ON"], ["M5L", "Toronto", "ON"],
  ["M5V", "Toronto", "ON"], ["M6A", "Toronto", "ON"], ["M6B", "Toronto", "ON"],
  ["L4B", "Richmond Hill", "ON"], ["L4C", "Richmond Hill", "ON"],
  ["L3R", "Markham", "ON"], ["L3S", "Markham", "ON"], ["L3T", "Markham", "ON"],
  ["L6P", "Brampton", "ON"], ["L6R", "Brampton", "ON"], ["L6S", "Brampton", "ON"],
  ["L4T", "Mississauga", "ON"], ["L4W", "Mississauga", "ON"], ["L4X", "Mississauga", "ON"],
  ["L4Y", "Mississauga", "ON"], ["L4Z", "Mississauga", "ON"], ["L5A", "Mississauga", "ON"],
  ["L7L", "Burlington", "ON"], ["L7M", "Burlington", "ON"], ["L7N", "Burlington", "ON"],
  ["L8P", "Hamilton", "ON"], ["L8R", "Hamilton", "ON"], ["L8S", "Hamilton", "ON"],
  ["N2G", "Waterloo", "ON"], ["N2H", "Waterloo", "ON"], ["N2J", "Waterloo", "ON"],
  ["N2L", "Waterloo", "ON"],
  ["N2A", "Kitchener", "ON"], ["N2B", "Kitchener", "ON"], ["N2C", "Kitchener", "ON"],
  ["N2E", "Kitchener", "ON"], ["N2M", "Kitchener", "ON"],
  ["N6A", "London", "ON"], ["N6B", "London", "ON"], ["N6C", "London", "ON"],
  ["N6E", "London", "ON"], ["N6G", "London", "ON"],
  ["K1A", "Ottawa", "ON"], ["K1B", "Ottawa", "ON"], ["K1C", "Ottawa", "ON"],
  ["K1G", "Ottawa", "ON"], ["K1H", "Ottawa", "ON"], ["K1J", "Ottawa", "ON"],
  ["K1K", "Ottawa", "ON"], ["K1L", "Ottawa", "ON"], ["K1M", "Ottawa", "ON"],
  ["K1N", "Ottawa", "ON"], ["K1P", "Ottawa", "ON"], ["K1R", "Ottawa", "ON"],
  ["K1S", "Ottawa", "ON"], ["K1T", "Ottawa", "ON"], ["K1V", "Ottawa", "ON"],
  ["P3A", "Sudbury", "ON"], ["P3B", "Sudbury", "ON"], ["P3C", "Sudbury", "ON"],
  ["P3E", "Sudbury", "ON"],
  ["P7A", "Thunder Bay", "ON"], ["P7B", "Thunder Bay", "ON"], ["P7C", "Thunder Bay", "ON"],

  // Prince Edward Island (PE)
  ["C1A", "Charlottetown", "PE"], ["C1B", "Charlottetown", "PE"], ["C1C", "Charlottetown", "PE"],
  ["C1E", "Charlottetown", "PE"],
  ["C0B", "Summerside", "PE"], ["C1N", "Summerside", "PE"],

  // Quebec (QC)
  ["H1A", "Montreal", "QC"], ["H1B", "Montreal", "QC"], ["H1C", "Montreal", "QC"],
  ["H2A", "Montreal", "QC"], ["H2B", "Montreal", "QC"], ["H2C", "Montreal", "QC"],
  ["H2H", "Montreal", "QC"], ["H2J", "Montreal", "QC"], ["H2K", "Montreal", "QC"],
  ["H2L", "Montreal", "QC"], ["H2M", "Montreal", "QC"], ["H2N", "Montreal", "QC"],
  ["H2P", "Montreal", "QC"], ["H2R", "Montreal", "QC"], ["H2S", "Montreal", "QC"],
  ["H3A", "Montreal", "QC"], ["H3B", "Montreal", "QC"], ["H3C", "Montreal", "QC"],
  ["H3G", "Montreal", "QC"], ["H3H", "Montreal", "QC"],
  ["G1K", "Quebec City", "QC"], ["G1L", "Quebec City", "QC"], ["G1M", "Quebec City", "QC"],
  ["G1N", "Quebec City", "QC"], ["G1P", "Quebec City", "QC"], ["G1R", "Quebec City", "QC"],
  ["G1S", "Quebec City", "QC"], ["G1T", "Quebec City", "QC"], ["G1V", "Quebec City", "QC"],
  ["J4H", "Longueuil", "QC"], ["J4J", "Longueuil", "QC"], ["J4K", "Longueuil", "QC"],
  ["J4L", "Longueuil", "QC"],
  ["J3Y", "Laval", "QC"], ["H7A", "Laval", "QC"], ["H7B", "Laval", "QC"],
  ["H7C", "Laval", "QC"], ["H7E", "Laval", "QC"], ["H7G", "Laval", "QC"],
  ["H7H", "Laval", "QC"], ["H7J", "Laval", "QC"],
  ["J2H", "Sherbrooke", "QC"], ["J1G", "Sherbrooke", "QC"], ["J1H", "Sherbrooke", "QC"],
  ["J1J", "Sherbrooke", "QC"], ["J1K", "Sherbrooke", "QC"],
  ["G8T", "Trois-Rivieres", "QC"], ["G8V", "Trois-Rivieres", "QC"], ["G8W", "Trois-Rivieres", "QC"],
  ["G9A", "Trois-Rivieres", "QC"],
  ["J7H", "Gatineau", "QC"], ["J8P", "Gatineau", "QC"], ["J8R", "Gatineau", "QC"],
  ["J8T", "Gatineau", "QC"], ["J8V", "Gatineau", "QC"],

  // Saskatchewan (SK)
  ["S4P", "Regina", "SK"], ["S4R", "Regina", "SK"], ["S4S", "Regina", "SK"],
  ["S4T", "Regina", "SK"], ["S4V", "Regina", "SK"], ["S4W", "Regina", "SK"],
  ["S4X", "Regina", "SK"], ["S4Y", "Regina", "SK"],
  ["S7H", "Saskatoon", "SK"], ["S7J", "Saskatoon", "SK"], ["S7K", "Saskatoon", "SK"],
  ["S7L", "Saskatoon", "SK"], ["S7M", "Saskatoon", "SK"], ["S7N", "Saskatoon", "SK"],
  ["S7P", "Saskatoon", "SK"],
  ["S9A", "Prince Albert", "SK"], ["S9V", "Prince Albert", "SK"],
  ["S9H", "Swift Current", "SK"],

  // Yukon (YT)
  ["Y1A", "Whitehorse", "YT"], ["Y0B", "Whitehorse", "YT"],
]

// Build an indexed map for O(1) lookups
const zipMap = new Map<string, ZipLookupResult>()
for (const [zip, city, state] of ZIP_DATA) {
  zipMap.set(zip, { zip, city, state })
}

/**
 * Look up a city/state from a US zip code.
 * Returns null if not found.
 */
export function lookupZip(zip: string): ZipLookupResult | null {
  const cleaned = zip.replace(/\D/g, "").slice(0, 5)
  return zipMap.get(cleaned) || null
}

/**
 * Get all cities in a given state.
 * Returns unique city names sorted alphabetically.
 */
export function getCitiesByState(stateCode: string): string[] {
  const cities = new Set<string>()
  for (const [, city, state] of ZIP_DATA) {
    if (state === stateCode) cities.add(city)
  }
  return Array.from(cities).sort()
}

/**
 * Get all zip codes for a city in a state.
 */
export function getZipsByCity(city: string, stateCode: string): string[] {
  return ZIP_DATA
    .filter(([, c, s]) => c === city && s === stateCode)
    .map(([z]) => z)
    .sort()
}

/**
 * Search zip/postal codes or cities matching a query string.
 * Handles both US zip codes (numeric) and Canadian postal prefixes (e.g. "T2P").
 * Returns up to `limit` results.
 */
export function searchLocations(query: string, limit = 10): ZipLookupResult[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const results: ZipLookupResult[] = []
  const seen = new Set<string>()

  // Exact US zip match (numeric 5-digit)
  const exactZip = zipMap.get(q.replace(/\D/g, "").slice(0, 5))
  if (exactZip) {
    results.push(exactZip)
    seen.add(`${exactZip.city}-${exactZip.state}`)
  }

  // Exact or prefix Canadian postal code match (e.g. "T2P" or "T2P 1A1")
  const postalPrefix = q.replace(/\s/g, "").slice(0, 3).toUpperCase()
  if (/^[A-Z]\d[A-Z]$/.test(postalPrefix)) {
    const match = zipMap.get(postalPrefix)
    if (match) {
      const key = `${match.city}-${match.state}`
      if (!seen.has(key)) {
        results.push(match)
        seen.add(key)
      }
    }
  }

  // City name matches
  for (const [zip, city, state] of ZIP_DATA) {
    const key = `${city}-${state}`
    if (seen.has(key)) continue
    if (city.toLowerCase().startsWith(q) || city.toLowerCase().includes(q)) {
      results.push({ zip, city, state })
      seen.add(key)
    }
    if (results.length >= limit) break
  }

  return results
}
