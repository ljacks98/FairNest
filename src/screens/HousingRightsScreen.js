import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
} from 'react-native';
import Navbar from '../components/Navbar';
import { COLORS } from '../utils/constants';
import { fontSize, font } from '../theme/typography';

const LANDLORD_CANNOT = [
  'Refuse to rent, sell, or negotiate because of a protected characteristic.',
  'Offer different rental terms, deposits, fees, or privileges to different tenants.',
  'Steer tenants toward or away from neighborhoods or buildings.',
  'Retaliate after a tenant asks questions, requests accommodation, or files a complaint.',
  'Harass, intimidate, threaten, or create a hostile housing environment.',
  'Use ads or listings that discourage applicants from protected groups.',
];

const ACTION_STEPS = [
  {
    id: 'document',
    step: '01',
    title: 'Document what happened',
    desc: 'Save dates, screenshots, ads, emails, texts, notices, and names. Small details are often what make a complaint easier to investigate.',
  },
  {
    id: 'local-help',
    step: '02',
    title: 'Talk to a Durham or NC advocate',
    desc: 'If you are unsure whether something is illegal, reach out early. Local and statewide fair housing teams can help you understand your options.',
  },
  {
    id: 'report',
    step: '03',
    title: 'Choose where to report',
    desc: 'You may be able to report to HUD, Durham Human Relations, or another agency depending on the situation and what kind of help you need.',
  },
  {
    id: 'support',
    step: '04',
    title: 'Ask for accommodation or support',
    desc: 'Disability-related accommodation requests, language access needs, and eviction support can all change what the next best step looks like.',
  },
];

const PROTECTED_CLASSES = [
  {
    id: 'race-color',
    title: 'Race & Color',
    scope: 'Federal and Durham protections',
    detail:
      'Housing providers cannot treat people differently because of race or skin color in renting, selling, advertising, repairs, renewals, or neighborhood steering.',
  },
  {
    id: 'religion',
    title: 'Religion',
    scope: 'Federal and Durham protections',
    detail:
      'A landlord or property manager cannot deny housing, apply different rules, or create a hostile environment because of religious belief, practice, or nonbelief.',
  },
  {
    id: 'sex-gender',
    title: 'Sex & Gender',
    scope: 'Federal and Durham protections',
    detail:
      'Sex discrimination can include unequal treatment, sexual harassment, and other conduct tied to sex or gender in housing access and tenancy.',
  },
  {
    id: 'orientation-identity',
    title: 'Sexual Orientation & Gender Identity',
    scope: 'Durham ordinance',
    detail:
      'The City of Durham says its fair housing protections include sexual orientation and sexual identity in addition to the federal baseline rules.',
  },
  {
    id: 'origin',
    title: 'National Origin',
    scope: 'Federal and Durham protections',
    detail:
      'It is illegal to discriminate because of ancestry, ethnicity, birthplace, language background, or because someone appears to be from a particular country or region.',
  },
  {
    id: 'disability',
    title: 'Disability',
    scope: 'Federal and Durham protections',
    detail:
      'Disability protections can include equal treatment plus reasonable accommodations or modifications, such as assistance-animal requests or accessible policy changes.',
  },
  {
    id: 'familial',
    title: 'Familial Status',
    scope: 'Federal and Durham protections',
    detail:
      'Families with children, pregnant tenants, and people securing custody of children are protected from rules or refusals that target households with kids.',
  },
  {
    id: 'military',
    title: 'Military Status',
    scope: 'Durham ordinance',
    detail:
      'Durham says local fair housing protections include military status, expanding beyond the core federal protected classes listed in the Fair Housing Act.',
  },
  {
    id: 'hairstyles',
    title: 'Protected Hairstyles',
    scope: 'Durham ordinance',
    detail:
      'Durham includes protected hairstyles in its local nondiscrimination enforcement, which can matter when discrimination is tied to race-based appearance rules.',
  },
];

const DISCRIMINATION_SCENARIOS = [
  {
    id: 'steering',
    title: 'Neighborhood Steering',
    example:
      'A real estate agent only shows you properties in certain neighborhoods based on your race or ethnicity, while showing other areas to white clients.',
    violation:
      'Race and national origin discrimination under the Fair Housing Act.',
    tip: 'Document which properties were shown to you vs. what was available. Request listings in writing.',
  },
  {
    id: 'familial',
    title: 'Refusing Families with Children',
    example:
      'A landlord tells you the unit is unavailable after learning you have children, but you later see it listed again online.',
    violation:
      'Familial status discrimination — unless the property qualifies as senior housing.',
    tip: 'Save the original listing, screenshot the re-posted ad, and note the dates of each interaction.',
  },
  {
    id: 'disability-denial',
    title: 'Denying a Reasonable Accommodation',
    example:
      'Your landlord refuses to allow an emotional support animal despite a letter from your doctor, citing a "no pets" policy.',
    violation:
      'Disability discrimination — assistance animals are not pets under fair housing law.',
    tip: 'Put your accommodation request in writing. Keep copies of your medical documentation and any landlord response.',
  },
  {
    id: 'retaliation',
    title: 'Retaliation After a Complaint',
    example:
      'After you report a maintenance issue or ask about your rights, your landlord raises your rent, threatens eviction, or stops making repairs.',
    violation:
      'Retaliation is separately prohibited under the Fair Housing Act.',
    tip: 'Document the timeline: when you complained, what changed afterward, and any written notices.',
  },
  {
    id: 'different-terms',
    title: 'Different Terms or Conditions',
    example:
      'A property manager requires a higher security deposit from tenants of a certain national origin, or enforces guest policies more strictly against certain tenants.',
    violation: 'Discrimination in terms, conditions, or privileges of housing.',
    tip: 'Compare your lease terms with neighbors if possible. Note any verbal rules that differ from the written lease.',
  },
  {
    id: 'harassment',
    title: 'Hostile Housing Environment',
    example:
      'A landlord or neighbor repeatedly makes slurs, threats, or unwanted advances that make you feel unsafe in your home.',
    violation:
      'Harassment based on a protected class can violate both federal and Durham fair housing law.',
    tip: 'Keep a written log with dates, times, witnesses, and exact words. Report threats to police and to a fair housing agency.',
  },
];

const FAIR_HOUSING_ACT_SECTIONS = [
  {
    id: 'what-is-it',
    title: 'What is the Fair Housing Act?',
    content:
      'The Fair Housing Act is a federal law (Title VIII of the Civil Rights Act of 1968) that prohibits discrimination in housing because of race, color, national origin, religion, sex, familial status, or disability. It covers most housing including rentals, sales, lending, and insurance. The law was strengthened by amendments in 1988 that added disability and familial status protections.',
  },
  {
    id: 'who-it-covers',
    title: 'Who does it protect?',
    content:
      'The law protects anyone who is buying, renting, or living in housing from being treated differently because of a protected characteristic. This includes tenants, homebuyers, people seeking mortgage loans, and residents of apartments, houses, condos, and mobile homes. It also protects people who help others exercise their fair housing rights.',
  },
  {
    id: 'what-it-prohibits',
    title: 'What does it prohibit?',
    content:
      'The Act makes it illegal to refuse to rent or sell housing, set different terms or conditions, falsely deny availability, make discriminatory advertisements, threaten or retaliate against someone exercising their rights, or fail to make reasonable accommodations for people with disabilities. It covers actions by landlords, real estate agents, lenders, homeowner associations, and local governments.',
  },
  {
    id: 'durham-additions',
    title: 'How does Durham go further?',
    content:
      "The City of Durham's fair housing ordinance adds protections beyond the federal baseline. Durham includes sexual orientation, gender identity, military status, and protected hairstyles as locally protected classes. The city's Human Relations Division handles local complaints and can investigate violations of both federal and local protections.",
  },
  {
    id: 'enforcement',
    title: 'How is it enforced?',
    content:
      'Fair housing complaints can be filed with HUD (the U.S. Department of Housing and Urban Development), the North Carolina Human Relations Commission, or Durham Human Relations. HUD investigates complaints at no cost to the person filing. If a violation is found, remedies can include compensation, policy changes, civil penalties, and injunctive relief.',
  },
];

const COMPLAINT_PROCESS_STEPS = [
  {
    id: 'recognize',
    step: '01',
    title: 'Recognize the issue',
    desc: 'Ask whether the treatment you experienced is connected to a protected characteristic — race, disability, family status, religion, sex, national origin, or a Durham-protected class. Not every bad landlord experience is discrimination, but if the reason relates to who you are, it may be.',
  },
  {
    id: 'gather',
    step: '02',
    title: 'Gather your evidence',
    desc: 'Save everything: emails, text messages, lease agreements, photos, ads, notices, voicemails, and written notes with dates. The stronger your documentation, the easier it is for an investigator to act on your complaint.',
  },
  {
    id: 'contact',
    step: '03',
    title: 'Contact a fair housing organization',
    desc: 'Before filing, you can talk to Legal Aid NC (1-855-797-FAIR), Durham Human Relations (919-560-4570), or a local housing counselor. They can help you understand whether you have a case and what filing option fits best.',
  },
  {
    id: 'file',
    step: '04',
    title: 'File a complaint',
    desc: 'You can file with HUD online at hud.gov, by phone at 1-800-669-9777, or in person at a local HUD office. You can also file with Durham Human Relations or the NC Human Relations Commission. HUD complaints should be filed within 1 year of the last discriminatory act.',
  },
  {
    id: 'investigation',
    step: '05',
    title: 'Investigation begins',
    desc: 'After filing, HUD or the local agency will notify the housing provider, gather evidence from both sides, and may interview witnesses. The investigator decides whether there is reasonable cause to believe discrimination occurred. This process can take several months.',
  },
  {
    id: 'resolution',
    step: '06',
    title: 'Resolution or hearing',
    desc: 'If reasonable cause is found, the case may be resolved through conciliation (a voluntary agreement), an administrative hearing, or a federal court case. Remedies can include monetary damages, policy changes, and civil penalties. If no cause is found, you may still pursue a private lawsuit within 2 years.',
  },
];

const QUICK_FACTS = [
  {
    label: 'HUD timing',
    value:
      'HUD says allegations under the Fair Housing Act should be filed within 1 year of the last alleged discriminatory act.',
  },
  {
    label: 'Durham contact',
    value:
      'Durham Human Relations says residents can call 919-560-4570 to discuss housing discrimination.',
  },
  {
    label: 'Legal help',
    value:
      'Legal Aid NC lists its Fair Housing Helpline as 1-855-797-FAIR during weekday business hours.',
  },
];

const LOCAL_NOTE_ITEMS = [
  'Durham says its ordinance covers sexual orientation, sexual identity, military status, and protected hairstyles.',
  'The City says hostile-environment harassment and sexual harassment can also violate fair housing rules.',
  'HUD has separate guidance for disability accommodations, including assistance animals.',
];

const RESOURCE_LINKS = [
  {
    id: 'durham-human-relations',
    eyebrow: 'City of Durham',
    title: 'Human Relations and Fair Housing',
    desc: 'Read Durham fair housing protections and find the city complaint pathway for local housing discrimination issues.',
    url: 'https://www.durhamnc.gov/4811/Human-Relations',
  },
  {
    id: 'legal-aid-helpline',
    eyebrow: 'Legal Aid NC',
    title: 'Fair Housing Helpline',
    desc: 'Official helpline for housing discrimination questions in North Carolina: 1-855-797-FAIR.',
    url: 'https://legalaidnc.org/cta/fair-housing-helpline/',
  },
  {
    id: 'hud-process',
    eyebrow: 'HUD',
    title: 'Report and Investigation Process',
    desc: 'Learn how HUD handles fair housing allegations and why filing quickly matters.',
    url: 'https://www.hud.gov/stat/fheo/intake-investigation',
  },
  {
    id: 'durham-housing-authority',
    eyebrow: 'Durham Housing Authority',
    title: 'Housing Programs',
    desc: 'Explore public housing, voucher programs, and local housing stability information.',
    url: 'https://www.durhamhousingauthority.org/housing-programs',
  },
  {
    id: 'durham-affordable-housing',
    eyebrow: 'City of Durham',
    title: 'Affordable Housing and Community Development',
    desc: 'City housing and neighborhood services resources related to affordability, retention, and neighborhood support.',
    url: 'https://www.durhamnc.gov/445/Community-Development',
  },
  {
    id: 'eviction-diversion',
    eyebrow: 'City of Durham',
    title: 'Eviction Diversion Program',
    desc: 'City-backed eviction support information administered through Legal Aid of North Carolina.',
    url: 'https://www.durhamnc.gov/4611/Eviction-Diversion',
  },
  {
    id: 'hud-assistance-animals',
    eyebrow: 'HUD',
    title: 'Assistance Animals and Accommodations',
    desc: 'Official HUD guidance for disability-related assistance animal requests and reasonable accommodation rules.',
    url: 'https://www.hud.gov/helping-americans/assistance-animals',
  },
];

function SnapshotRow({ label, value }) {
  return (
    <View style={styles.snapshotRow}>
      <Text style={styles.snapshotLabel}>{label}</Text>
      <Text style={styles.snapshotValue}>{value}</Text>
    </View>
  );
}

export default function HousingRightsScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMedium = width >= 760;
  const isWide = width >= 1120;

  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [hoveredClass, setHoveredClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(PROTECTED_CLASSES[0].id);
  const [expandedScenario, setExpandedScenario] = useState(null);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);

  const activeClass =
    PROTECTED_CLASSES.find((item) => item.id === hoveredClass) ||
    PROTECTED_CLASSES.find((item) => item.id === selectedClass) ||
    PROTECTED_CLASSES[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.pageFill}>
      <Navbar navigation={navigation} currentRoute="HousingRights" />

      <View style={styles.hero}>
        <View style={styles.heroGlowA} />
        <View style={styles.heroGlowB} />
        <View style={[styles.heroInner, isMedium && styles.heroInnerWide]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroLabel}>KNOW YOUR RIGHTS</Text>
            <Text style={styles.heroTitle}>Housing Rights in Durham</Text>
            <Text style={styles.heroSub}>
              Federal law and Durham's local ordinance give residents more
              housing protections than many people realize. This page is a
              practical starting point for understanding what is covered and
              where to get help.
            </Text>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Federal baseline</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  Durham-specific additions
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  Official resource links
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.heroGuide}>
            <Text style={styles.heroGuideLabel}>Start here</Text>
            {QUICK_FACTS.map((fact) => (
              <View key={fact.label} style={styles.heroGuideRow}>
                <View style={styles.heroGuideDot} />
                <View style={styles.heroGuideCopy}>
                  <Text style={styles.heroGuideTitle}>{fact.label}</Text>
                  <Text style={styles.heroGuideText}>{fact.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.workspace}>
        <View style={[styles.overviewDeck, isWide && styles.overviewDeckWide]}>
          <View style={[styles.sideRail, isWide && styles.sideRailWide]}>
            <View style={[styles.sidePanel, isWide && styles.sidePanelWide]}>
              <Text style={styles.sidePanelEyebrow}>Quick Facts</Text>
              <Text style={styles.sidePanelTitle}>
                Important timing and contacts
              </Text>
              <View style={styles.snapshotCard}>
                {QUICK_FACTS.map((fact) => (
                  <SnapshotRow
                    key={fact.label}
                    label={fact.label}
                    value={fact.value}
                  />
                ))}
              </View>
            </View>

            <View
              style={[styles.sidePanelMuted, isWide && styles.sidePanelWide]}>
              <Text style={styles.sidePanelEyebrow}>Durham Note</Text>
              <Text style={styles.sidePanelTitle}>
                Local protections can go further
              </Text>
              <Text style={styles.sidePanelText}>
                Durham says its Human Relations Division enforces both the
                federal Fair Housing Act and the City's fair housing ordinance.
              </Text>
              <View style={styles.noteList}>
                {LOCAL_NOTE_ITEMS.map((item) => (
                  <View key={item} style={styles.noteRow}>
                    <View style={styles.noteDot} />
                    <Text style={styles.noteText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.overviewMain}>
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>WHO IS PROTECTED</Text>
              <Text style={styles.sectionTitle}>
                Protected classes under the law
              </Text>
              <Text style={styles.sectionDesc}>
                Hover across the categories below to preview what each
                protection generally covers. Durham also lists several local
                protections beyond the basic federal Fair Housing Act
                categories.
              </Text>

              <View style={styles.classExplorer}>
                <View style={styles.tagGrid}>
                  {PROTECTED_CLASSES.map((item) => {
                    const isActive = activeClass.id === item.id;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.9}
                        onPress={() => setSelectedClass(item.id)}
                        onMouseEnter={() => setHoveredClass(item.id)}
                        onMouseLeave={() => setHoveredClass(null)}
                        style={[styles.tag, isActive && styles.tagActive]}>
                        <Text
                          style={[
                            styles.tagText,
                            isActive && styles.tagTextActive,
                          ]}>
                          {item.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.classDetailCard}>
                  <Text style={styles.classDetailScope}>
                    {activeClass.scope}
                  </Text>
                  <Text style={styles.classDetailTitle}>
                    {activeClass.title}
                  </Text>
                  <Text style={styles.classDetailText}>
                    {activeClass.detail}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardAccent} />
              <View style={styles.cardInner}>
                <Text style={styles.cardLabel}>LANDLORD OBLIGATIONS</Text>
                <Text style={styles.cardTitle}>What landlords cannot do</Text>
                {LANDLORD_CANNOT.map((item) => (
                  <View key={item} style={styles.listRow}>
                    <View style={styles.listDot} />
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>COMMON SCENARIOS</Text>
              <Text style={styles.sectionTitle}>
                Recognizing housing discrimination
              </Text>
              <Text style={styles.sectionDesc}>
                These real-world examples show how discrimination can appear in
                everyday housing situations. Tap any scenario to see more
                detail.
              </Text>

              <View style={styles.articleList}>
                {DISCRIMINATION_SCENARIOS.map((item) => {
                  const isOpen = expandedScenario === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.articleCard,
                        isOpen && styles.articleCardOpen,
                      ]}
                      onPress={() =>
                        setExpandedScenario(isOpen ? null : item.id)
                      }
                      activeOpacity={0.75}
                      accessibilityLabel={`${item.title} scenario`}>
                      <View style={styles.articleHeader}>
                        <Text style={styles.articleTitle}>{item.title}</Text>
                        <Text style={styles.articleToggle}>
                          {isOpen ? '−' : '+'}
                        </Text>
                      </View>
                      {isOpen && (
                        <View style={styles.articleBody}>
                          <Text style={styles.articleSubhead}>Example</Text>
                          <Text style={styles.articleText}>{item.example}</Text>
                          <Text style={styles.articleSubhead}>
                            Why it violates the law
                          </Text>
                          <Text style={styles.articleText}>
                            {item.violation}
                          </Text>
                          <Text style={styles.articleSubhead}>What to do</Text>
                          <Text style={styles.articleText}>{item.tip}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>THE LAW</Text>
              <Text style={styles.sectionTitle}>
                Understanding the Fair Housing Act
              </Text>
              <Text style={styles.sectionDesc}>
                The Fair Housing Act is the foundation of housing discrimination
                protections in the United States. Tap any section to learn more.
              </Text>

              <View style={styles.articleList}>
                {FAIR_HOUSING_ACT_SECTIONS.map((item) => {
                  const isOpen = expandedArticle === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.articleCard,
                        isOpen && styles.articleCardOpen,
                      ]}
                      onPress={() =>
                        setExpandedArticle(isOpen ? null : item.id)
                      }
                      activeOpacity={0.75}
                      accessibilityLabel={`${item.title} article`}>
                      <View style={styles.articleHeader}>
                        <Text style={styles.articleTitle}>{item.title}</Text>
                        <Text style={styles.articleToggle}>
                          {isOpen ? '−' : '+'}
                        </Text>
                      </View>
                      {isOpen && (
                        <View style={styles.articleBody}>
                          <Text style={styles.articleText}>{item.content}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.sourceRow}>
                <Text style={styles.sourceLabel}>Sources: </Text>
                <Text
                  style={styles.sourceLink}
                  onPress={() =>
                    Linking.openURL(
                      'https://www.hud.gov/program_offices/fair_housing_equal_opp/fair_housing_act_overview'
                    )
                  }>
                  HUD.gov — Fair Housing Act
                </Text>
                <Text style={styles.sourceSep}> · </Text>
                <Text
                  style={styles.sourceLink}
                  onPress={() =>
                    Linking.openURL(
                      'https://www.justice.gov/crt/fair-housing-act-1'
                    )
                  }>
                  DOJ — Fair Housing Act Text
                </Text>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>COMPLAINT PROCESS</Text>
              <Text style={styles.sectionTitle}>
                How a fair housing complaint works
              </Text>
              <Text style={styles.sectionDesc}>
                Filing a complaint is free and confidential. Here is what
                happens at each stage, from recognizing an issue to resolution.
              </Text>

              <View style={styles.articleList}>
                {COMPLAINT_PROCESS_STEPS.map((item) => {
                  const isOpen = expandedStep === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.articleCard,
                        isOpen && styles.articleCardOpen,
                      ]}
                      onPress={() => setExpandedStep(isOpen ? null : item.id)}
                      activeOpacity={0.75}
                      accessibilityLabel={`Step ${item.step}: ${item.title}`}>
                      <View style={styles.articleHeader}>
                        <View style={styles.stepBadge}>
                          <Text style={styles.stepBadgeText}>{item.step}</Text>
                        </View>
                        <Text style={[styles.articleTitle, { flex: 1 }]}>
                          {item.title}
                        </Text>
                        <Text style={styles.articleToggle}>
                          {isOpen ? '−' : '+'}
                        </Text>
                      </View>
                      {isOpen && (
                        <View style={styles.articleBody}>
                          <Text style={styles.articleText}>{item.desc}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>TAKE ACTION</Text>
              <Text style={styles.sectionTitle}>What you can do next</Text>
              <View
                style={[styles.actionGrid, isMedium && styles.actionGridWide]}>
                {ACTION_STEPS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={1}
                    onPress={() => {}}
                    onMouseEnter={() => setHoveredAction(item.id)}
                    onMouseLeave={() => setHoveredAction(null)}
                    style={[
                      styles.actionCard,
                      isMedium && styles.actionCardWide,
                      hoveredAction === item.id && styles.actionCardHover,
                    ]}>
                    <View style={styles.actionStepBadge}>
                      <Text style={styles.actionStepText}>{item.step}</Text>
                    </View>
                    <View style={styles.actionText}>
                      <Text style={styles.actionTitle}>{item.title}</Text>
                      <Text style={styles.actionDesc}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.resourcesCard}>
              <Text style={styles.cardLabel}>OFFICIAL RESOURCES</Text>
              <Text style={styles.cardTitle}>
                More Durham and fair housing links
              </Text>
              <Text style={styles.resourcesIntro}>
                These links point to City of Durham, HUD, Durham Housing
                Authority, and Legal Aid NC pages that are relevant to local
                housing rights, discrimination reporting, and support.
              </Text>

              {RESOURCE_LINKS.map((item, index) => {
                const isHovered = hoveredLink === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.linkRow,
                      index === RESOURCE_LINKS.length - 1 && styles.linkRowLast,
                      isHovered && styles.linkRowHover,
                    ]}
                    onPress={() => Linking.openURL(item.url)}
                    onMouseEnter={() => setHoveredLink(item.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                    activeOpacity={0.75}>
                    <View style={styles.linkIcon}>
                      <Text style={styles.linkIconText}>Go</Text>
                    </View>
                    <View style={styles.linkContent}>
                      <Text style={styles.linkEyebrow}>{item.eyebrow}</Text>
                      <Text
                        style={[
                          styles.linkTitle,
                          isHovered && styles.linkTitleHover,
                        ]}>
                        {item.title}
                      </Text>
                      <Text style={styles.linkSub}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.ctaRow}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  hoveredBtn === 'primary' && styles.primaryBtnHover,
                ]}
                onPress={() => navigation.navigate('DiscriminationChecker')}
                onMouseEnter={() => setHoveredBtn('primary')}
                onMouseLeave={() => setHoveredBtn(null)}
                activeOpacity={0.75}>
                <Text style={styles.primaryBtnText}>
                  Check If You Qualify to File
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryBtn,
                  hoveredBtn === 'secondary' && styles.secondaryBtnHover,
                ]}
                onPress={() =>
                  navigation.navigate('Resources', { category: 'housing' })
                }
                onMouseEnter={() => setHoveredBtn('secondary')}
                onMouseLeave={() => setHoveredBtn(null)}
                activeOpacity={0.75}>
                <Text
                  style={[
                    styles.secondaryBtnText,
                    hoveredBtn === 'secondary' && styles.secondaryBtnTextHover,
                  ]}>
                  Find Local Housing Resources
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.disclaimer}>
              This page is educational and not legal advice. If you need advice
              on a specific situation, contact a qualified advocate or attorney.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5EF',
  },
  pageFill: {
    paddingBottom: 56,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: COLORS.primaryDeep,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 112,
  },
  heroGlowA: {
    position: 'absolute',
    top: -120,
    right: -40,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(133, 196, 112, 0.18)',
  },
  heroGlowB: {
    position: 'absolute',
    bottom: -180,
    left: -80,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroInner: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    gap: 28,
  },
  heroInnerWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
    maxWidth: 720,
  },
  heroLabel: {
    color: COLORS.gold,
    fontSize: fontSize.caption,
    ...font.extra,
    letterSpacing: 2.2,
    marginBottom: 14,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: fontSize.hero,
    ...font.extra,
    lineHeight: fontSize.hero * 1.08,
    marginBottom: 14,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: fontSize.bodyLg,
    lineHeight: 30,
    maxWidth: 650,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  heroBadge: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroBadgeText: {
    color: '#F5FAF0',
    fontSize: fontSize.caption,
    ...font.bold,
  },
  heroGuide: {
    width: '100%',
    maxWidth: 390,
    padding: 24,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 16,
  },
  heroGuideLabel: {
    color: '#E7F3DD',
    fontSize: fontSize.caption,
    ...font.extra,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  heroGuideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroGuideDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#D5EEBE',
    marginTop: 8,
  },
  heroGuideCopy: {
    flex: 1,
  },
  heroGuideTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.small,
    ...font.extra,
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  heroGuideText: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: fontSize.caption,
    lineHeight: 20,
  },
  workspace: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    paddingHorizontal: 24,
    marginTop: 28,
    gap: 28,
  },
  overviewDeck: {
    gap: 24,
  },
  overviewDeckWide: {
    gap: 24,
  },
  sideRail: {
    width: '100%',
    gap: 18,
  },
  sideRailWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  overviewMain: {
    width: '100%',
    minWidth: 0,
  },
  sidePanel: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 4,
  },
  sidePanelMuted: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#EEF5E9',
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  sidePanelWide: {
    flex: 1,
    minWidth: 0,
  },
  sidePanelEyebrow: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    ...font.extra,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sidePanelTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h4,
    ...font.extra,
    marginBottom: 12,
  },
  sidePanelText: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 22,
    marginBottom: 16,
  },
  snapshotCard: {
    borderRadius: 22,
    backgroundColor: '#F7FAF4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  snapshotRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27, 94, 32, 0.08)',
  },
  snapshotLabel: {
    color: COLORS.textMuted,
    fontSize: fontSize.tiny,
    ...font.extra,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  snapshotValue: {
    color: COLORS.textPrimary,
    fontSize: fontSize.small,
    lineHeight: 21,
  },
  noteList: {
    gap: 14,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 7,
  },
  noteText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 22,
  },
  sectionBlock: {
    marginBottom: 28,
  },
  sectionLabel: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    ...font.extra,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h2,
    ...font.extra,
    marginBottom: 12,
  },
  sectionDesc: {
    color: COLORS.textMuted,
    fontSize: fontSize.body,
    lineHeight: 27,
    marginBottom: 18,
    maxWidth: 860,
  },
  classExplorer: {
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    padding: 22,
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: '#FBFCF8',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagActive: {
    backgroundColor: '#EEF7E8',
    borderColor: 'rgba(46, 125, 50, 0.35)',
    transform: [{ translateY: -1 }],
  },
  tagText: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
    ...font.bold,
  },
  tagTextActive: {
    color: COLORS.primaryDeep,
  },
  classDetailCard: {
    borderRadius: 24,
    backgroundColor: '#F7FAF4',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
  },
  classDetailScope: {
    color: COLORS.primary,
    fontSize: fontSize.tiny,
    ...font.extra,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  classDetailTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h4,
    ...font.extra,
    marginBottom: 8,
  },
  classDetailText: {
    color: COLORS.textMuted,
    fontSize: fontSize.body,
    lineHeight: 26,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  cardAccent: {
    width: 5,
    backgroundColor: COLORS.primaryDeep,
  },
  cardInner: {
    flex: 1,
    padding: 24,
  },
  cardLabel: {
    color: COLORS.primary,
    fontSize: fontSize.caption,
    ...font.extra,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.h3,
    ...font.extra,
    marginBottom: 16,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
    gap: 12,
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryDeep,
    marginTop: 7,
    flexShrink: 0,
  },
  listText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: fontSize.small,
    lineHeight: 23,
  },
  actionGrid: {
    gap: 14,
  },
  actionGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  actionCardWide: {
    flex: 1,
    minWidth: 280,
  },
  actionCardHover: {
    transform: [{ translateY: -2 }],
    borderColor: 'rgba(46, 125, 50, 0.28)',
    backgroundColor: '#F7FBF3',
  },
  actionStepBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#EAF4E3',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionStepText: {
    color: COLORS.primaryDeep,
    fontSize: fontSize.caption,
    ...font.extra,
    letterSpacing: 0.8,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.body,
    ...font.extra,
    marginBottom: 6,
  },
  actionDesc: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
    lineHeight: 22,
  },
  articleList: {
    gap: 8,
    marginTop: 8,
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    overflow: 'hidden',
  },
  articleCardOpen: {
    borderColor: 'rgba(46, 125, 50, 0.2)',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  articleTitle: {
    flex: 1,
    fontSize: fontSize.body,
    color: COLORS.textPrimary,
    ...font.bold,
  },
  articleToggle: {
    fontSize: fontSize.subtitle,
    color: COLORS.primary,
    ...font.bold,
    width: 24,
    textAlign: 'center',
  },
  articleBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27, 94, 32, 0.06)',
  },
  articleSubhead: {
    fontSize: fontSize.caption,
    color: COLORS.primary,
    ...font.extra,
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 4,
  },
  articleText: {
    fontSize: fontSize.small,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: fontSize.caption,
    color: '#FFFFFF',
    ...font.extra,
  },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 16,
  },
  sourceLabel: {
    fontSize: fontSize.caption,
    color: COLORS.textMuted,
    ...font.medium,
  },
  sourceLink: {
    fontSize: fontSize.caption,
    color: COLORS.primary,
    ...font.bold,
  },
  sourceSep: {
    fontSize: fontSize.caption,
    color: COLORS.textMuted,
  },
  resourcesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 32, 0.08)',
    shadowColor: '#142013',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  resourcesIntro: {
    color: COLORS.textMuted,
    fontSize: fontSize.small,
    lineHeight: 24,
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1EA',
    borderRadius: 18,
  },
  linkRowLast: {
    borderBottomWidth: 0,
  },
  linkRowHover: {
    backgroundColor: '#F4F9EF',
    paddingHorizontal: 10,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF4E3',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  linkIconText: {
    color: COLORS.primaryDeep,
    fontSize: fontSize.caption,
    ...font.extra,
  },
  linkContent: {
    flex: 1,
  },
  linkEyebrow: {
    color: COLORS.primary,
    fontSize: fontSize.tiny,
    ...font.extra,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  linkTitle: {
    color: COLORS.textPrimary,
    fontSize: fontSize.small,
    ...font.extra,
    marginBottom: 4,
  },
  linkTitleHover: {
    color: COLORS.primaryDeep,
  },
  linkSub: {
    color: COLORS.textMuted,
    fontSize: fontSize.caption,
    lineHeight: 21,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  primaryBtn: {
    flexGrow: 1,
    minWidth: 260,
    backgroundColor: COLORS.primaryDeep,
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: 'center',
  },
  primaryBtnHover: {
    backgroundColor: COLORS.primary,
    transform: [{ translateY: -1 }],
  },
  primaryBtnText: {
    color: COLORS.white,
    ...font.extra,
    fontSize: fontSize.button,
  },
  secondaryBtn: {
    flexGrow: 1,
    minWidth: 260,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    color: COLORS.primary,
    ...font.extra,
    fontSize: fontSize.button,
  },
  secondaryBtnHover: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    transform: [{ translateY: -1 }],
  },
  secondaryBtnTextHover: {
    color: '#FFFFFF',
  },
  disclaimer: {
    color: '#768071',
    fontSize: fontSize.tiny,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
});
