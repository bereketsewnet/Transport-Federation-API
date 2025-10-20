// Create CMS tables directly using Sequelize sync
const HomeContent = require('./src/models/homeContent.model');
const AboutContent = require('./src/models/aboutContent.model');
const Executive = require('./src/models/executive.model');
const ContactInfo = require('./src/models/contactInfo.model');
const sequelize = require('./src/config/db');

async function createTables() {
  try {
    console.log('🚀 Creating CMS tables using Sequelize...\n');
    
    // Create tables using Sequelize sync
    await HomeContent.sync({ force: true });
    console.log('✅ home_content table created');
    
    await AboutContent.sync({ force: true });
    console.log('✅ about_content table created');
    
    await Executive.sync({ force: true });
    console.log('✅ executives table created');
    
    await ContactInfo.sync({ force: true });
    console.log('✅ contact_info table created');
    
    console.log('\n📊 Inserting default data...');
    
    // Insert default home content
    await HomeContent.create({
      hero_title_en: 'Transport & Communication Workers Federation',
      hero_title_am: 'የትራንስፖርትና መገናኛ ሠራተኞች ማኅበራት ፌዴሬሽን',
      hero_subtitle_en: 'Empowering workers across Ethiopia\'s transport and communication sectors',
      hero_subtitle_am: 'በኢትዮጵያ የትራንስፖርትና መገናኛ ዘርፎች ውስጥ የሰራተኞችን አቅም ማሳደግ',
      overview_en: 'The Industrial Federation of Transport and Communication Workers of Ethiopia (TCWF) is a national trade union federation representing workers in the transport and communication sectors.',
      overview_am: 'የኢትዮጵያ የትራንስፖርትና መገናኛ ሠራተኞች የኢንዱስትሪ ፌዴሬሽን (TCWF) በትራንስፖርትና መገናኛ ዘርፎች ውስጥ የሚሰሩ ሠራተኞችን የሚወክል የብሔራዊ የሠራተኛ ማኅበር ፌዴሬሽን ነው።',
      stat1_value: 1250,
      stat2_value: 19,
      stat3_value: 50,
      stat4_value: 100
    });
    console.log('✅ Default home content inserted');
    
    // Insert default about content
    await AboutContent.create({
      mission_en: 'To organize workers in unions and federations to protect their rights and improve their working conditions.',
      mission_am: 'ሠራተኛዉን በማኅበርና ፌዴሬሽን ውስጥ በማደራጀት የእነሱን መብት በመጠበቅና የስራ ሁኔታቸውን በማሻሻል።',
      vision_en: 'To see workers with guaranteed rights, fair wages, and safe working conditions across all transport and communication sectors.',
      vision_am: 'የሥራ ዋስትናው የተረጋገጠ፣ ፍትሃዊ ደሞዝ፣ እና ደህንነቱ የተጠበቀ የስራ ሁኔታ ያላቸው ሠራተኞች በሁሉም የትራንስፖርትና መገናኛ ዘርፎች ውስጥ እንዲታዩ።',
      values_en: ['Humanity', 'Commitment', 'Democratic Culture', 'Transparency', 'Unity'],
      values_am: ['ሰበዓዊነት', 'ቁርጠኝነት', 'የዲሞክራሲ ባህል', 'ግልጽነት', 'አንድነት'],
      history_en: 'The Industrial Federation of Transport and Communication Workers of Ethiopia was established to represent and protect the rights of workers in these vital sectors.',
      history_am: 'የኢትዮጵያ የትራንስፖርትና መገናኛ ሠራተኞች የኢንዱስትሪ ፌዴሬሽን በእነዚህ አስፈላጊ ዘርፎች ውስጥ የሚሰሩ ሠራተኞችን ለመወከልና መብታቸውን ለመጠበቅ ተመሠርቷል።',
      objectives_en: ['To organize unions and federations', 'To protect workers rights', 'To improve working conditions', 'To provide training and education'],
      objectives_am: ['በአገሪቱ የአሠሪና ሠራተኛ ግንኙነት ውስጥ የሠራተኛውን አቅም ማሳደግ', 'የሠራተኛውን መብት መጠበቅ', 'የስራ ሁኔታ ማሻሻል', 'ስልጠናና ትምህርት መስጠት'],
      structure_departments_en: ['President', 'Secretary General', 'Treasurer', 'Organizing Secretary'],
      structure_departments_am: ['ፕሬዝዳንት', 'ዋና ፀሀፊ', 'ክፍያ አስተዳዳሪ', 'የማደራጀት ፀሀፊ'],
      stakeholders_list_en: ['Affiliated basic unions', 'Peer Federations', 'Government agencies', 'International organizations'],
      stakeholders_list_am: ['በፌዴሬሽኑ ሥር የተደራጁ መሰረታዊ ማኅበራት', 'አቻ ፌዴሬሽኖች', 'የመንግሥት አገልግሎቶች', 'ዓለም አቀፍ ድርጅቶች']
    });
    console.log('✅ Default about content inserted');
    
    // Insert default executives
    const executives = [
      { name_en: 'Abathun Takele', name_am: 'አባትሁን ታከለ', position_en: 'President', position_am: 'ፕሬዝዳንት', type: 'executive', display_order: 1 },
      { name_en: 'Kebede Worku', name_am: 'ከበደ ወርቁ', position_en: 'Secretary General', position_am: 'ዋና ፀሀፊ', type: 'executive', display_order: 2 },
      { name_en: 'Tigist Hailu', name_am: 'ጥግስት ሀይሉ', position_en: 'Treasurer', position_am: 'ክፍያ አስተዳዳሪ', type: 'executive', display_order: 3 },
      { name_en: 'Meron Assefa', name_am: 'መሮን አሰፋ', position_en: 'Organizing Secretary', position_am: 'የማደራጀት ፀሀፊ', type: 'executive', display_order: 4 },
      { name_en: 'Yonas Tadesse', name_am: 'ዮናስ ታደሰ', position_en: 'Legal Advisor', position_am: 'የህግ አማካሪ', type: 'expert', display_order: 5 },
      { name_en: 'Selamawit Gebre', name_am: 'ሰላማዊት ገብረ', position_en: 'Training Coordinator', position_am: 'የስልጠና አስተባባሪ', type: 'expert', display_order: 6 },
      { name_en: 'Dawit Mekonnen', name_am: 'ዳዊት መኮንን', position_en: 'International Relations', position_am: 'ዓለም አቀፍ ግንኙነት', type: 'expert', display_order: 7 },
      { name_en: 'Hirut Tesfaye', name_am: 'ሂሩት ተስፋዬ', position_en: 'Women Affairs', position_am: 'የሴቶች ጉዳይ', type: 'expert', display_order: 8 }
    ];
    
    await Executive.bulkCreate(executives);
    console.log('✅ Default executives inserted');
    
    // Insert default contact info
    await ContactInfo.create({
      address_en: 'Addis Ababa, Ethiopia',
      address_am: 'አዲስ አበባ፣ ኢትዮጵያ',
      phone: '+251-11-XXX-XXXX',
      email: 'info@tcwf-ethiopia.org',
      working_hours_en: 'Monday - Friday: 8:30 AM - 5:00 PM',
      working_hours_am: 'ሰኞ - አርብ: 8:30 ጠዋት - 5:00 ከሰዓት'
    });
    console.log('✅ Default contact info inserted');
    
    console.log('\n🎉 CMS setup completed successfully!');
    console.log('\n✅ You can now:');
    console.log('   1. Start your server: npm run dev');
    console.log('   2. Test endpoints: curl http://localhost:4000/api/cms/home-content');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

createTables()
  .then(() => {
    console.log('\n✅ Setup script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup script failed:', error);
    process.exit(1);
  });

