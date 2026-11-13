import type {UILocale} from '@/lib/ui-copy';
// Local output effects only. No character, pitch or microphone samples enter service requests.
export const CHARACTERS = [
 {id:'natural',rate:1,filter:1,drive:0,wobble:0},
 {id:'old-man',rate:.78,filter:.18,drive:.12,wobble:0},
 {id:'baby',rate:1.65,filter:1,drive:0,wobble:0},
 {id:'giant',rate:.6,filter:.12,drive:0,wobble:0},
 {id:'chipmunk',rate:1.8,filter:1,drive:0,wobble:0},
 {id:'robot',rate:.95,filter:.65,drive:.5,wobble:35},
 {id:'alien',rate:1.3,filter:.8,drive:.15,wobble:22},
 {id:'monster',rate:.65,filter:.3,drive:.5,wobble:12},
 {id:'radio',rate:1,filter:.12,drive:.3,wobble:0},
 {id:'sleepy',rate:.72,filter:.28,drive:0,wobble:0},
 {id:'fairy',rate:1.45,filter:1,drive:0,wobble:5},
 {id:'wizard',rate:.82,filter:.2,drive:.08,wobble:4},
 {id:'space-pilot',rate:1.05,filter:.15,drive:.2,wobble:30},
 {id:'villain',rate:.7,filter:.22,drive:.18,wobble:0},
 {id:'storyteller',rate:.9,filter:.5,drive:0,wobble:0},
 {id:'cartoon',rate:1.35,filter:1,drive:.08,wobble:0},
 {id:'tiny',rate:1.55,filter:.75,drive:0,wobble:0},
 {id:'cave',rate:.68,filter:.1,drive:.1,wobble:3},
 {id:'android',rate:1,filter:.5,drive:.35,wobble:48},
 {id:'dream',rate:.85,filter:.35,drive:0,wobble:6},
 {id:'office-calm',rate:.95,filter:.9,drive:0,wobble:0},
 {id:'presenter',rate:1,filter:1,drive:0,wobble:0},
 {id:'warm-service',rate:.92,filter:.8,drive:0,wobble:0},
 {id:'formal',rate:.88,filter:.85,drive:0,wobble:0},
] as const;
export function characterFor(id:string){return CHARACTERS.find(c=>c.id===id)??CHARACTERS[0];}
export function characterRate(id:string,pitchRate:number){return Math.min(1.8,Math.max(.55,characterFor(id).rate*pitchRate));}
export function applyCharacter(chunks:Float32Array[],id:string){
 const c=characterFor(id);let previous=0,index=0;
 return chunks.map(chunk=>Float32Array.from(chunk,sample=>{
  previous+=c.filter*(sample-previous);
  const shaped=c.drive?Math.tanh(previous*(1+c.drive*6))/(1+c.drive*2):previous;
  const modulation=c.wobble?.7+.3*Math.cos(2*Math.PI*c.wobble*index/24000):1;index++;
  return Math.max(-1,Math.min(1,shaped*modulation));
 }));
}
const names:Record<UILocale,string[]>={
 en:['Natural','Old man','Baby-like','Gentle giant','Chipmunk','Robot','Alien','Monster','Vintage radio','Sleepy','Fairy','Wizard','Space pilot','Movie villain','Storyteller','Cartoon','Tiny voice','Cave creature','Android','Dreamy'],
 es:['Natural','Anciano','Como bebé','Gigante amable','Ardilla','Robot','Alienígena','Monstruo','Radio antigua','Soñoliento','Hada','Mago','Piloto espacial','Villano de cine','Narrador','Caricatura','Voz diminuta','Criatura de cueva','Androide','De ensueño'],
 tl:['Natural','Matandang lalaki','Parang sanggol','Mabait na higante','Chipmunk','Robot','Alien','Halimaw','Lumang radyo','Inaantok','Diwata','Salamangkero','Piloto sa kalawakan','Kontrabida','Tagapagsalaysay','Cartoon','Munting boses','Nilalang sa kuweba','Android','Parang panaginip'],
 zh:['自然','老爷爷','婴儿风格','温柔巨人','花栗鼠','机器人','外星人','怪兽','复古电台','困倦','仙子','巫师','太空飞行员','电影反派','讲故事的人','卡通','小小声音','洞穴生物','仿生人','梦幻'],
 de:['Natürlich','Alter Mann','Babyartig','Sanfter Riese','Streifenhörnchen','Roboter','Alien','Monster','Altes Radio','Schläfrig','Fee','Zauberer','Weltraumpilot','Filmschurke','Erzähler','Zeichentrick','Winzige Stimme','Höhlenwesen','Android','Verträumt'],
 ja:['自然','おじいさん風','赤ちゃん風','優しい巨人','シマリス','ロボット','宇宙人','モンスター','レトロラジオ','眠そう','妖精','魔法使い','宇宙パイロット','映画の悪役','語り手','アニメ風','小さな声','洞窟の生き物','アンドロイド','夢のような声'],
};
export const characterCopy:Record<UILocale,{label:string;note:string}>={
 en:{label:'Character effect',note:'Playful effects on synthesized speech, not real age or identity matching. Pitch, speed and texture may change. Effects add no synthesis charge; premium voice still uses your approved credit.'},
 es:{label:'Efecto de personaje',note:'Efectos divertidos sobre voz sintetizada, no imitación real de edad o identidad. Pueden cambiar tono, velocidad y textura. Sin cargo extra por efectos; la voz premium usa tu crédito aprobado.'},
 tl:{label:'Epekto ng karakter',note:'Masasayang epekto sa sintetikong boses, hindi tunay na pagtutugma ng edad o identidad. Maaaring magbago ang pitch, bilis at tunog. Walang dagdag na bayad sa epekto; ginagamit ng premium ang aprubadong credit.'},
 zh:{label:'角色音效',note:'合成语音的趣味效果，并非真实年龄或身份匹配。音高、速度和音色可能改变。音效无额外合成收费；高级语音仍使用您批准的额度。'},
 de:{label:'Charaktereffekt',note:'Spielerische Effekte auf synthetische Sprache, keine echte Alters- oder Identitätsnachbildung. Tonhöhe, Tempo und Klang können sich ändern. Effekte kosten nicht zusätzlich; Premium nutzt dein genehmigtes Guthaben.'},
 ja:{label:'キャラクター効果',note:'合成音声の楽しい効果で、実際の年齢や個性の再現ではありません。音高・速度・音色が変化します。効果の追加料金はなく、プレミアム音声は承認済み残高を使用します。'},
};
const professionalNames:Record<UILocale,string[]>={en:['Calm office','Clear presenter','Warm customer service','Formal meeting'],es:['Oficina tranquila','Presentador claro','Atención cordial','Reunión formal'],de:['Ruhiges Büro','Klarer Vortrag','Freundlicher Service','Formelles Meeting'],tl:['Kalmadong opisina','Malinaw na presenter','Magiliw na serbisyo','Pormal na pulong'],zh:['沉稳办公','清晰演讲','亲切客服','正式会议'],ja:['落ち着いたオフィス','明瞭な発表','温かい接客','正式な会議']};
export function characterOptions(locale:UILocale){return CHARACTERS.map((c,i)=>({...c,label:names[locale][i]??professionalNames[locale][i-20]??c.id}));}