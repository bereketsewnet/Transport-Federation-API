-- Insert default CMS data for MySQL
-- This script inserts initial data into the CMS tables

-- Insert default home content (singleton)
INSERT INTO home_content (
  hero_title_en, hero_title_am, hero_subtitle_en, hero_subtitle_am,
  overview_en, overview_am,
  stat1_label_en, stat1_label_am, stat1_value,
  stat2_label_en, stat2_label_am, stat2_value,
  stat3_label_en, stat3_label_am, stat3_value,
  stat4_label_en, stat4_label_am, stat4_value
) VALUES (
  'Transport & Communication Workers Federation',
  'የትራንስፖርትና መገናኛ ሠራተኞች ማኅበራት ፌዴሬሽን',
  'Empowering workers across Ethiopia''s transport and communication sectors',
  'በኢትዮጵያ የትራንስፖርትና መገናኛ ዘርፎች ውስጥ የሰራተኞችን አቅም ማሳደግ',
  'The Industrial Federation of Transport and Communication Workers of Ethiopia (TCWF) is a national trade union federation representing workers in the transport and communication sectors.',
  'የኢትዮጵያ የትራንስፖርትና መገናኛ ሠራተኞች የኢንዱስትሪ ፌዴሬሽን (TCWF) በትራንስፖርትና መገናኛ ዘርፎች ውስጥ የሚሰሩ ሠራተኞችን የሚወክል የብሔራዊ የሠራተኛ ማኅበር ፌዴሬሽን ነው።',
  'Active Members', 'ንቁ አባላት', 1250,
  'Worker Unions', 'የሰራተኛ ማህበራት', 19,
  'Years of Service', 'የአገልግሎት ዓመታት', 50,
  'Protection Rate (%)', 'የጥበቃ መጠን (%)', 100
) ON DUPLICATE KEY UPDATE id = id;

-- Insert default about content (singleton)
INSERT INTO about_content (
  mission_en, mission_am, vision_en, vision_am,
  values_en, values_am, history_en, history_am,
  objectives_en, objectives_am,
  structure_title_en, structure_title_am,
  structure_departments_en, structure_departments_am,
  stakeholders_title_en, stakeholders_title_am,
  stakeholders_list_en, stakeholders_list_am
) VALUES (
  'To organize workers in unions and federations to protect their rights and improve their working conditions.',
  'ሠራተኛዉን በማኅበርና ፌዴሬሽን ውስጥ በማደራጀት የእነሱን መብት በመጠበቅና የስራ ሁኔታቸውን በማሻሻል።',
  'To see workers with guaranteed rights, fair wages, and safe working conditions across all transport and communication sectors.',
  'የሥራ ዋስትናው የተረጋገጠ፣ ፍትሃዊ ደሞዝ፣ እና ደህንነቱ የተጠበቀ የስራ ሁኔታ ያላቸው ሠራተኞች በሁሉም የትራንስፖርትና መገናኛ ዘርፎች ውስጥ እንዲታዩ።',
  '["Humanity", "Commitment", "Democratic Culture", "Transparency", "Unity"]',
  '["ሰበዓዊነት", "ቁርጠኝነት", "የዲሞክራሲ ባህል", "ግልጽነት", "አንድነት"]',
  'The Industrial Federation of Transport and Communication Workers of Ethiopia was established to represent and protect the rights of workers in these vital sectors.',
  'የኢትዮጵያ የትራንስፖርትና መገናኛ ሠራተኞች የኢንዱስትሪ ፌዴሬሽን በእነዚህ አስፈላጊ ዘርፎች ውስጥ የሚሰሩ ሠራተኞችን ለመወከልና መብታቸውን ለመጠበቅ ተመሠርቷል።',
  '["To organize unions and federations", "To protect workers rights", "To improve working conditions", "To provide training and education"]',
  '["በአገሪቱ የአሠሪና ሠራተኛ ግንኙነት ውስጥ የሠራተኛውን አቅም ማሳደግ", "የሠራተኛውን መብት መጠበቅ", "የስራ ሁኔታ ማሻሻል", "ስልጠናና ትምህርት መስጠት"]',
  'Federation Structure', 'የፌዴሬሽኑ አወቃቀር',
  '["President", "Secretary General", "Treasurer", "Organizing Secretary"]',
  '["ፕሬዝዳንት", "ዋና ፀሀፊ", "ክፍያ አስተዳዳሪ", "የማደራጀት ፀሀፊ"]',
  'Key Stakeholders', 'ባለድርሻ አካላት',
  '["Affiliated basic unions", "Peer Federations", "Government agencies", "International organizations"]',
  '["በፌዴሬሽኑ ሥር የተደራጁ መሰረታዊ ማኅበራት", "አቻ ፌዴሬሽኖች", "የመንግሥት አገልግሎቶች", "ዓለም አቀፍ ድርጅቶች"]'
) ON DUPLICATE KEY UPDATE id = id;

-- Insert default executives
INSERT INTO executives (name_en, name_am, position_en, position_am, type, display_order) VALUES
('Abathun Takele', 'አባትሁን ታከለ', 'President', 'ፕሬዝዳንት', 'executive', 1),
('Kebede Worku', 'ከበደ ወርቁ', 'Secretary General', 'ዋና ፀሀፊ', 'executive', 2),
('Tigist Hailu', 'ጥግስት ሀይሉ', 'Treasurer', 'ክፍያ አስተዳዳሪ', 'executive', 3),
('Meron Assefa', 'መሮን አሰፋ', 'Organizing Secretary', 'የማደራጀት ፀሀፊ', 'executive', 4),
('Yonas Tadesse', 'ዮናስ ታደሰ', 'Legal Advisor', 'የህግ አማካሪ', 'expert', 5),
('Selamawit Gebre', 'ሰላማዊት ገብረ', 'Training Coordinator', 'የስልጠና አስተባባሪ', 'expert', 6),
('Dawit Mekonnen', 'ዳዊት መኮንን', 'International Relations', 'ዓለም አቀፍ ግንኙነት', 'expert', 7),
('Hirut Tesfaye', 'ሂሩት ተስፋዬ', 'Women Affairs', 'የሴቶች ጉዳይ', 'expert', 8)
ON DUPLICATE KEY UPDATE id = id;

-- Insert default contact info (singleton)
INSERT INTO contact_info (
  address_en, address_am, phone, email,
  working_hours_en, working_hours_am,
  facebook_url, twitter_url, linkedin_url
) VALUES (
  'Addis Ababa, Ethiopia',
  'አዲስ አበባ፣ ኢትዮጵያ',
  '+251-11-XXX-XXXX',
  'info@tcwf-ethiopia.org',
  'Monday - Friday: 8:30 AM - 5:00 PM',
  'ሰኞ - አርብ: 8:30 ጠዋት - 5:00 ከሰዓት',
  'https://facebook.com/tcwf-ethiopia',
  'https://twitter.com/tcwf-ethiopia',
  'https://linkedin.com/company/tcwf-ethiopia'
) ON DUPLICATE KEY UPDATE id = id;
