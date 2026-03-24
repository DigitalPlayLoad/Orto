/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, Calendar, BookOpen, Activity, Clock, 
  CheckCircle2, Circle, AlertCircle, Phone, Syringe, 
  FileText, Users, Printer, Bell, Search, Plus, CheckSquare, Trash2, X, Download, Upload, Edit2,
  AlertTriangle, Info, ChevronDown, ChevronUp, Map, Sun, Moon, Package, MessageSquare, Bed, Lightbulb, Key, Monitor, Copy, Book, Check, ExternalLink
} from 'lucide-react';

// --- MOCK DATA BASED ON USER NOTES ---

const formatSurgeryType = (type: string) => {
  const lowerType = type.toLowerCase();
  if (!lowerType.includes('tratamento cirúrgico') && !lowerType.includes('tratamento cirurgico')) {
    return `Tratamento cirúrgico de ${type}`;
  }
  return type;
};

const getAutomaticNotes = (surg: any) => {
  let notes = surg.notes ? [surg.notes] : [];
  const lowerType = surg.type.toLowerCase();
  
  if (lowerType.includes('mão') || lowerType.includes('mao') || lowerType.includes('dedo') || lowerType.includes('carpo') || lowerType.includes('metacarpo') || lowerType.includes('falange')) {
    notes.push('Incluir Caixa de Mão');
  }
  
  if (lowerType.includes('plexo')) {
    notes.push('Incluir Caixa de Micro');
  }
  
  if (surg.opme) {
    notes.push('Intensificador de imagem e perfurador');
  }
  
  return notes.length > 0 ? notes.join(' | ') : null;
};

const MOCK_SURGERIES: any[] = [];

const DICAS_CATEGORIZADAS = [
  {
    category: "Sistemas e Prontuários",
    icon: <Monitor className="w-5 h-5 text-blue-500" />,
    items: [
      {
        title: "Kit Curativo no Tasy",
        desc: "1. Acesse: Suprimentos/CME > Requisição de Materiais.\n2. Localizar Paciente: Use o atalho 'AT'.\n3. Aba Itens: Busque por 'Kit Curativo', 'Bacia' e 'Instrumental' (Kits 3, 2 e 5).\n4. Dica: Use o filtro 'Conjuntos' para adicionar na requisição.",
        icon: <Syringe className="w-5 h-5 text-rose-500" />
      },
      {
        title: "Evolução Rápida no Tasy",
        desc: "Texto padrão para evolução na sala de curativo:\n- 'Orto - tala e gesso'\n- 'retiradas'",
        icon: <CheckSquare className="w-5 h-5 text-emerald-500" />
      },
      {
        title: "Fix It - Gerenciamento de Senhas",
        desc: "- Duplique a aba e acesse o gerenciamento de senhas.\n- Senha 73: Referente ao Consultório 2.",
        icon: <Key className="w-5 h-5 text-amber-500" />
      },
      {
        title: "Termo de Alta Complexidade",
        desc: "Caminho: Arquivo -> Formulário Criar -> Consentimento Informado.\n- Dar orientações\n- Coletar assinatura do paciente\n- Agendar no Ambulatório 4.",
        icon: <FileText className="w-5 h-5 text-indigo-500" />
      },
      {
        title: "Sistema API Externo",
        desc: "Acesse o sistema de API externo para consultas e integrações.",
        link: "http://137.131.212.177:3001/api",
        icon: <ExternalLink className="w-5 h-5 text-blue-600" />
      }
    ]
  },
  {
    category: "Suprimentos e Pedidos",
    icon: <Package className="w-5 h-5 text-orange-500" />,
    items: [
      {
        title: "Centro de Custo e Pedidos (527)",
        desc: "- Centro de Custo: 527\n- Almoxarifado Central: Pedir a maioria dos itens.\n- Farmácia Dispensação: Pedir seringas.",
        icon: <Package className="w-5 h-5 text-orange-500" />
      },
      {
        title: "Torneirinha de 3 Vias",
        desc: "Para infiltração, pedir na requisição de medicamentos dentro da farmácia dispensação (código 119).",
        icon: <Activity className="w-5 h-5 text-blue-500" />
      },
      {
        title: "Materiais Específicos e de Mão (CME)",
        desc: "Falar com a Lorena no CME quando for material específico ou de cirurgia da mão que não vai para OPME (ex: agulha de treina e caixa de mão).",
        icon: <Package className="w-5 h-5 text-teal-500" />
      },
      {
        title: "Luxação e Caixas de Ombro",
        desc: "Em caso de luxação, vai a caixa de ombro. Lembre-se de mandar foto para a Lorena.",
        icon: <Package className="w-5 h-5 text-indigo-500" />
      }
    ]
  },
  {
    category: "Processos e Burocracia",
    icon: <FileText className="w-5 h-5 text-purple-500" />,
    items: [
      {
        title: "Atestados do Particular",
        desc: "Quem faz o atestado de acompanhante para o particular é a Tati. Pendência de guia sem carimbar do particular também fica com ela.",
        icon: <FileText className="w-5 h-5 text-purple-500" />
      },
      {
        title: "Cotação de Cirurgias (Comercial)",
        desc: "Para solicitar orçamento e cotar valores de cirurgia, fale com Eliane, Samuel ou Janaína do Comercial. A cotação é feita com prótese importada e nacional.",
        icon: <Users className="w-5 h-5 text-blue-500" />
      },
      {
        title: "Auditoria de Prontuários (Particular)",
        desc: "A auditoria encaminha prontuários do particular sem descrição. Devemos mandar no grupo para que os médicos façam o ajuste.",
        icon: <AlertCircle className="w-5 h-5 text-red-500" />
      },
      {
        title: "Cancelamentos de Cirurgia",
        desc: "Sempre que houver cancelamentos de cirurgias, lembre-se de avisar o OPME imediatamente.",
        icon: <AlertTriangle className="w-5 h-5 text-orange-500" />
      },
      {
        title: "Códigos de Cirurgia (Aviso Importante)",
        desc: "Atenção (Aviso da Claudirene):\n- Código SUS: Começa com 4080\n- Código Convênio: Começa com 31\n- Fique atento: Códigos vindo como 31 em cirurgias SUS serão negadas.",
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />
      }
    ]
  },
  {
    category: "Atendimento e Procedimentos",
    icon: <Users className="w-5 h-5 text-emerald-500" />,
    items: [
      {
        title: "Envio de Documentos pelo WhatsApp",
        desc: "Ao mandar mensagens no WhatsApp, envie sempre:\n- Nome\n- Data de Nascimento\n- Foto do Retorno\n- Foto do Pedido do RX",
        icon: <MessageSquare className="w-5 h-5 text-green-500" />
      },
      {
        title: "Alta do PS para Ortopedia",
        desc: "Pergunte sobre pendências no PS e solicite o PC na Orto. Estando tudo certo, o médico dará a alta.",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      },
      {
        title: "Dr. Juan Capriotti (Chefe da Ortopedia)",
        desc: "Atende na segunda-feira de manhã e quarta-feira de tarde.",
        icon: <Users className="w-5 h-5 text-blue-600" />
      },
      {
        title: "Valores de Infiltração",
        desc: "- 1 dose: R$ 2.300\n- 2 etapas: R$ 4.900\n- Taxa de sala: R$ 125",
        icon: <Syringe className="w-5 h-5 text-emerald-500" />
      },
      {
        title: "Reserva de UTI (Risco Moderado/Alto)",
        desc: "- Obrigatório para risco moderado/alto.\n- Exemplo: FX Fêmur em pacientes > 60/70 anos.",
        icon: <Bed className="w-5 h-5 text-red-500" />
      }
    ]
  },
  {
    category: "Estudos e Apresentações",
    icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
    items: [
      {
        title: "Tema para Apresentação",
        desc: "Fixador externo + Artroplastia Total de Quadril.",
        icon: <BookOpen className="w-5 h-5 text-indigo-500" />
      }
    ]
  }
];

const SIGTAP_CODES = [
  { code: "0408010018", desc: "ARTROPLASTIA TOTAL DE QUADRIL (PRÓTESE)", definition: "Substituição completa da articulação do quadril por componentes protéticos (acetábulo e fêmur)." },
  { code: "0408010026", desc: "ARTROPLASTIA TOTAL DE JOELHO (PRÓTESE)", definition: "Substituição da articulação do joelho por prótese metálica e polietileno." },
  { code: "0408020013", desc: "TRATAMENTO CIRURGICO DE FRATURA DO FEMUR PROXIMAL", definition: "Fixação interna de fraturas na região do colo ou trocanter do fêmur." },
  { code: "0408020021", desc: "TRATAMENTO CIRURGICO DE FRATURA DA DIAFISE DO FEMUR", definition: "Redução e fixação (geralmente com haste intramedular) de fratura no corpo do fêmur." },
  { code: "0408020030", desc: "TRATAMENTO CIRURGICO DE FRATURA DO FEMUR DISTAL", definition: "Fixação de fraturas na região próxima ao joelho (supracondiliana)." },
  { code: "0408030019", desc: "TRATAMENTO CIRURGICO DE FRATURA DA DIAFISE DA TIBIA", definition: "Estabilização cirúrgica de fratura na canela (tíbia)." },
  { code: "0408030027", desc: "TRATAMENTO CIRURGICO DE FRATURA DO MALEOLO LATERAL / MEDIAL", definition: "Cirurgia para fixação de fratura no tornozelo (interna ou externa)." },
  { code: "0408040014", desc: "TRATAMENTO CIRURGICO DE FRATURA DO UMERO PROXIMAL", definition: "Fixação de fratura na região do ombro (cabeça do úmero)." },
  { code: "0408040022", desc: "TRATAMENTO CIRURGICO DE FRATURA DA DIAFISE DO UMERO", definition: "Fixação de fratura no osso do braço (úmero)." },
  { code: "0408050010", desc: "TRATAMENTO CIRURGICO DE FRATURA DO RADIO / ULNA (DIAFISE)", definition: "Fixação de fratura nos ossos do antebraço." },
  { code: "0408050028", desc: "TRATAMENTO CIRURGICO DE FRATURA DO RADIO DISTAL", definition: "Fixação de fratura no punho (rádio distal)." },
  { code: "0408060015", desc: "TRATAMENTO CIRURGICO DE FRATURA DA CLAVICULA", definition: "Fixação de fratura no osso da clavícula." },
  { code: "0408060023", desc: "TRATAMENTO CIRURGICO DE FRATURA DA ESCAPULA", definition: "Fixação cirúrgica de fratura na 'pá' do ombro." },
  { code: "0408010034", desc: "ARTROPLASTIA PARCIAL DE QUADRIL", definition: "Substituição apenas da cabeça femoral, mantendo o acetábulo original." },
  { code: "0408010042", desc: "REVISÃO DE ARTROPLASTIA DE QUADRIL", definition: "Troca de componentes de uma prótese de quadril prévia por falha ou desgaste." },
  { code: "0408010050", desc: "REVISÃO DE ARTROPLASTIA DE JOELHO", definition: "Substituição de prótese de joelho antiga por novos componentes." },
  { code: "0408020048", desc: "TRATAMENTO CIRURGICO DE FRATURA DO COLO DO FEMUR", definition: "Fixação ou substituição devido a fratura intracapsular do fêmur." },
  { code: "0408020056", desc: "TRATAMENTO CIRURGICO DE FRATURA TRANSTROCANTERIANA", definition: "Fixação de fratura entre o grande e o pequeno trocanter do fêmur." },
  { code: "0408020064", desc: "TRATAMENTO CIRURGICO DE FRATURA SUBTROCANTERIANA", definition: "Fixação de fratura localizada logo abaixo do pequeno trocanter." },
  { code: "0408030035", desc: "TRATAMENTO CIRURGICO DE FRATURA DO PLATEAU TIBIAL", definition: "Fixação de fratura na superfície articular superior da tíbia." },
  { code: "0408030043", desc: "TRATAMENTO CIRURGICO DE FRATURA DA PATELA", definition: "Fixação da 'rótula' do joelho (geralmente com banda de tensão)." },
  { code: "0408030051", desc: "TRATAMENTO CIRURGICO DE FRATURA DO PILAO TIBIAL", definition: "Fixação de fratura complexa na extremidade distal da tíbia." },
  { code: "0408040030", desc: "TRATAMENTO CIRURGICO DE FRATURA DA DIAFISE DO UMERO C/ PLACA", definition: "Uso de placa e parafusos para fixar fratura no braço." },
  { code: "0408040049", desc: "TRATAMENTO CIRURGICO DE FRATURA DA DIAFISE DO UMERO C/ HASTE", definition: "Uso de haste dentro do osso para fixar fratura no braço." },
  { code: "0408050036", desc: "TRATAMENTO CIRURGICO DE FRATURA DO OLECRAO", definition: "Fixação de fratura na ponta do cotovelo (ulna proximal)." },
  { code: "0408050044", desc: "TRATAMENTO CIRURGICO DE FRATURA DA CABEÇA DO RADIO", definition: "Fixação ou ressecção de fratura na parte superior do rádio (cotovelo)." },
  { code: "0408060031", desc: "TRATAMENTO CIRURGICO DE LUXAÇÃO ACROMIO-CLAVICULAR", definition: "Reparo de lesão ligamentar que separa a clavícula do acrômio." },
  { code: "0408060040", desc: "TRATAMENTO CIRURGICO DE LESÃO MANGUITO ROTADOR", definition: "Reparo dos tendões que estabilizam o ombro." },
  { code: "0409010011", desc: "AMPUTAÇÃO / DESARTICULAÇÃO DE MEMBROS INFERIORES", definition: "Remoção cirúrgica de parte ou totalidade da perna/pé." },
  { code: "0409020017", desc: "AMPUTAÇÃO / DESARTICULAÇÃO DE MEMBROS SUPERIORES", definition: "Remoção cirúrgica de parte ou totalidade do braço/mão." },
  { code: "0408050052", desc: "TRATAMENTO CIRURGICO DE SINDROME DO TUNEL DO CARPO", definition: "Descompressão do nervo mediano no punho." },
  { code: "0408050060", desc: "TENOPLASTIA / TENORRAFIA EM MEMBRO SUPERIOR", definition: "Reparo ou reconstrução de tendões no braço ou mão." },
  { code: "0408030060", desc: "RECONSTRUÇÃO LIGAMENTAR DE JOELHO (LCA / LCP)", definition: "Substituição de ligamento rompido por enxerto (tendão)." },
  { code: "0408030078", desc: "MENISCECTOMIA", definition: "Remoção parcial ou total de menisco lesionado no joelho." },
  { code: "0408030086", desc: "ARTROSCOPIA DE JOELHO", definition: "Procedimento por vídeo para diagnóstico ou tratamento no joelho." },
  { code: "0408040057", desc: "ARTROSCOPIA DE OMBRO", definition: "Procedimento por vídeo para diagnóstico ou tratamento no ombro." },
  { code: "0408050079", desc: "TRATAMENTO CIRURGICO DE FRATURA DOS OSSOS DO CARPO", definition: "Fixação de fraturas nos pequenos ossos do punho." },
  { code: "0408050087", desc: "TRATAMENTO CIRURGICO DE FRATURA DE METACARPIANO", definition: "Fixação de fratura nos ossos da palma da mão." },
  { code: "0408050095", desc: "TRATAMENTO CIRURGICO DE FRATURA DE FALANGE (MAO)", definition: "Fixação de fratura nos ossos dos dedos da mão." },
  { code: "0408030094", desc: "TRATAMENTO CIRURGICO DE FRATURA DE TORNOZELO (BIMALEOAR / TRIMALEOLAR)", definition: "Fixação de fraturas complexas envolvendo vários maléolos." },
  { code: "0408030108", desc: "TRATAMENTO CIRURGICO DE FRATURA DO CALCANEO", definition: "Fixação de fratura no osso do calcanhar." },
  { code: "0408030116", desc: "TRATAMENTO CIRURGICO DE FRATURA DO TALUS", definition: "Fixação de fratura no osso que conecta a perna ao pé." },
  { code: "0408030124", desc: "TRATAMENTO CIRURGICO DE FRATURA DE METATARSIANO", definition: "Fixação de fratura nos ossos do peito do pé." },
  { code: "0408030132", desc: "TRATAMENTO CIRURGICO DE FRATURA DE FALANGE (PE)", definition: "Fixação de fratura nos ossos dos dedos do pé." },
  { code: "0408030140", desc: "TRATAMENTO CIRURGICO DE LESÃO LIGAMENTAR DE TORNOZELO", definition: "Reparo de ligamentos rompidos no tornozelo." },
  { code: "0408060058", desc: "TRATAMENTO CIRURGICO DE LUXAÇÃO DE OMBRO", definition: "Estabilização cirúrgica após deslocamento do ombro." },
  { code: "0408060066", desc: "TRATAMENTO CIRURGICO DE LUXAÇÃO DE COTOVELO", definition: "Reparo de estruturas após deslocamento do cotovelo." },
  { code: "0408060074", desc: "TRATAMENTO CIRURGICO DE LUXAÇÃO DE QUADRIL", definition: "Redução e estabilização de deslocamento do quadril." },
  { code: "0408060082", desc: "TRATAMENTO CIRURGICO DE LUXAÇÃO DE JOELHO", definition: "Reparo complexo após deslocamento total do joelho." },
  { code: "0408060090", desc: "TRATAMENTO CIRURGICO DE LUXAÇÃO DE TORNOZELO", definition: "Estabilização após deslocamento da articulação do tornozelo." },
  { code: "0408010069", desc: "OSTEOTOMIA DE PELVE / FEMUR (PEDIATRICA)", definition: "Corte ósseo para realinhamento em crianças." },
  { code: "0408010077", desc: "TRATAMENTO CIRURGICO DE DISPLASIA DO QUADRIL", definition: "Correção cirúrgica de má formação no encaixe do quadril." },
  { code: "0408010085", desc: "TRATAMENTO CIRURGICO DE PE TORTO CONGENITO", definition: "Correção cirúrgica de deformidade congênita nos pés." },
  { code: "0408010093", desc: "ALONGAMENTO OSSEO (MEMBRO INFERIOR)", definition: "Uso de fixadores para aumentar o comprimento da perna." },
  { code: "0408010107", desc: "ALONGAMENTO OSSEO (MEMBRO SUPERIOR)", definition: "Uso de fixadores para aumentar o comprimento do braço." },
  { code: "0408010115", desc: "EPIFISIODESE", definition: "Parada cirúrgica do crescimento ósseo em uma placa epifisária." },
  { code: "0408020072", desc: "RETIRADA DE MATERIAL DE SINTESE (FEMUR)", definition: "Remoção de placas, parafusos ou hastes do fêmur." },
  { code: "0408030159", desc: "RETIRADA DE MATERIAL DE SINTESE (TIBIA / FIBULA)", definition: "Remoção de implantes da perna." },
  { code: "0408040065", desc: "RETIRADA DE MATERIAL DE SINTESE (UMERO)", definition: "Remoção de implantes do braço." },
  { code: "0408050109", desc: "RETIRADA DE MATERIAL DE SINTESE (RADIO / ULNA)", definition: "Remoção de implantes do antebraço." },
  { code: "0408060104", desc: "RETIRADA DE MATERIAL DE SINTESE (OUTROS OSSOS)", definition: "Remoção de implantes em diversas localizações." },
  { code: "0408010123", desc: "TRATAMENTO CIRURGICO DE PSEUDARTROSE", definition: "Cirurgia para tratar osso que não consolidou (não 'colou')." },
  { code: "0408010131", desc: "TRATAMENTO CIRURGICO DE OSTEOMIELITE", definition: "Limpeza cirúrgica de infecção no osso." },
  { code: "0408010140", desc: "BIOPSIA OSSEA", definition: "Coleta de amostra de tecido ósseo para análise laboratorial." },
  { code: "0408010158", desc: "RESSECÇÃO DE TUMOR OSSEO", definition: "Retirada cirúrgica de massa tumoral no osso." },
  { code: "0408010166", desc: "ENXERTO OSSEO", definition: "Colocação de osso (do próprio paciente ou banco) para preencher falhas." },
  { code: "0408010174", desc: "ARTRODESE DE GRANDES ARTICULAÇÕES", definition: "Fusão cirúrgica de articulações grandes (ex: quadril, joelho)." },
  { code: "0408010182", desc: "ARTRODESE DE MEDIAS ARTICULAÇÕES", definition: "Fusão cirúrgica de articulações médias (ex: tornozelo, punho)." },
  { code: "0408010190", desc: "ARTRODESE DE PEQUENAS ARTICULAÇÕES", definition: "Fusão cirúrgica de articulações pequenas (ex: dedos)." },
  { code: "0408060112", desc: "COLOCAÇÃO DE FIXADOR EXTERNO (GRANDE PORTE)", definition: "Instalação de estrutura externa para estabilização de ossos longos." },
];

const RAMAIS_DATA = [
  {
    category: "Setores e Serviços",
    icon: <Monitor className="w-5 h-5 text-blue-500" />,
    items: [
      { name: "ALMOXARIFADO", numbers: ["8190", "7193", "3910"] },
      { name: "ALOJAMENTO", numbers: ["7806"] },
      { name: "AMBULÂNCIA", numbers: ["8621"], highlight: true },
      { name: "AMBULATÓRIO PARTICULAR", numbers: ["8182"] },
      { name: "AMBULATÓRIO SUS", numbers: ["8223"] },
      { name: "AUDITORIA", numbers: ["8602"] },
      { name: "BANCO", numbers: ["8732", "8233"] },
      { name: "BANCO DE SANGUE", numbers: ["8256"] },
      { name: "C.O", numbers: ["7020"] },
      { name: "CAPELANIA", numbers: ["4001", "8747", "7813"] },
      { name: "CC2", numbers: ["2144", "8145", "7855"] },
      { name: "CCIH", numbers: ["7215", "8715"] },
      { name: "CIDHOTT", numbers: ["8713"] },
      { name: "CINTILOGRAFIA", numbers: ["3999"] },
      { name: "CLINIRAD", numbers: ["3957", "3930"] },
      { name: "CME", numbers: ["3917", "3918"] },
      { name: "COZINHA", numbers: ["7030"], highlight: true },
      { name: "MSIO", numbers: ["4007"] },
      { name: "G.O.", numbers: ["8612"] },
      { name: "GRÁFICA", numbers: ["8187"] },
      { name: "HEMO", numbers: ["7019"] },
      { name: "HEMODIALISE", numbers: ["8262"], highlight: true },
      { name: "LAB COLETA", numbers: ["7151", "7251", "8750"] },
      { name: "LAB RESULTADO", numbers: ["8739"] },
      { name: "LACTÁRIO", numbers: ["7040"] },
      { name: "LAVANDERIA", numbers: ["7397", "7786"], highlight: true },
      { name: "LIMPEZA", numbers: ["7333", "7497"], highlight: true },
      { name: "MANUTENÇÃO", numbers: ["7486"] },
      { name: "MANUTENÇÃO OBRA", numbers: ["7823"] },
      { name: "MAQ. UTI", numbers: ["8728"] },
      { name: "MAQ. NEFRO", numbers: ["3929"] },
      { name: "MAQ. RAIO X", numbers: ["8625"] },
      { name: "MAQ. TOMO/ECO", numbers: ["7293"] },
      { name: "PSICOLOGA", numbers: ["4023"] },
      { name: "QT", numbers: ["7069", "4069"] },
      { name: "RADIO", numbers: ["4068", "4070", "8126"] },
      { name: "RAIO X", numbers: ["8283"], highlight: true },
      { name: "RECEPÇÃO HEMO", numbers: ["7101", "7280", "8230"] },
      { name: "RECEPÇÃO PART", numbers: ["7150", "8149"] },
      { name: "RESSO", numbers: ["3970", "8629"] },
      { name: "RH", numbers: ["8734"] },
      { name: "ROUPARIA", numbers: ["3931", "8737", "1786"] },
      { name: "RECEPÇÃO PS", numbers: ["7240", "7086"] },
      { name: "SEGURANÇA", numbers: ["8925", "8180"], highlight: true },
      { name: "SERVIÇO SOCIAL", numbers: ["8744", "8743", "8231", "4071"], highlight: true },
      { name: "CC (CENTRO CIRÚRGICO)", numbers: ["7202", "7267"] },
      { name: "COORDENAÇÃO", numbers: ["8617"] },
      { name: "RECEP. CENTRAL", numbers: ["7150", "8149"] },
      { name: "ENF A", numbers: ["7469", "7225"], highlight: true },
      { name: "ENF B", numbers: ["8184"], highlight: true },
      { name: "FARMÁCIA", numbers: ["7197"] },
      { name: "FARMÁCIA CLINIRAD", numbers: ["8282"] },
    ]
  },
  {
    category: "Pessoas",
    icon: <Users className="w-5 h-5 text-emerald-500" />,
    items: [
      { name: "ADRI", numbers: ["8768"] },
      { name: "ALINE", numbers: ["7626"] },
      { name: "PRISCILA", numbers: ["7125"] },
      { name: "BEATRIZ", numbers: ["3938"] },
      { name: "BETO", numbers: ["8193"] },
      { name: "CELIA", numbers: ["8266", "8162"] },
      { name: "CHEFE MAQUEIROS (EDUARDO)", numbers: ["8843"] },
      { name: "CIÇA", numbers: ["4020"] },
      { name: "FAUSTO", numbers: ["4000"] },
      { name: "IVAN", numbers: ["7851"] },
      { name: "JESSICA", numbers: ["8253"] },
      { name: "JUDITE", numbers: ["8865", "8725"] },
      { name: "JULIANA SUS", numbers: ["8281"] },
      { name: "KARINE", numbers: ["3951"] },
      { name: "LEILA", numbers: ["3914"] },
      { name: "JOICE/ORTO", numbers: ["8159"] },
      { name: "PSIQUIATRA", numbers: ["8876", "8180"] },
      { name: "RAMON TX", numbers: ["7498"] },
      { name: "MIRIA", numbers: ["8122"] },
      { name: "YUNE", numbers: ["4046"] },
    ]
  },
  {
    category: "Secretarias Cardiologia",
    icon: <FileText className="w-5 h-5 text-rose-500" />,
    items: [
      { name: "SEC. DR CELSO / CARLOS CAST (DANI)", numbers: ["7711"] },
      { name: "SEC. DR KENJI / DR AMERICO (LUANA)", numbers: ["3911"] },
      { name: "SEC. DR MACHADO (JO)", numbers: ["7722"] },
      { name: "SEC. DR MULINARI / DR ADAM (DANI)", numbers: ["8797"] },
      { name: "SEC. DRA ANDREIA (CAMILA)", numbers: ["8628"] },
      { name: "SEC. DR NETO (SOFIA)", numbers: ["4027"] },
      { name: "SEC. DR FABIO (JUREMA)", numbers: ["3940"] },
      { name: "SEC. DR MAXIMILIANO / DR PAULO B (ANA)", numbers: ["8883"] },
      { name: "SEC. DR MILTON / DR CAPAVERDE (IVONE)", numbers: ["3924"] },
    ]
  }
];

const TECHNICAL_TERMS = [
  { term: "Artrodese", definition: "Procedimento cirúrgico que visa a fusão óssea de uma articulação, eliminando o movimento para tratar dor ou instabilidade grave." },
  { term: "Artroplastia", definition: "Cirurgia para substituir ou reconstruir uma articulação, geralmente utilizando próteses metálicas ou de polietileno." },
  { term: "Osteossíntese", definition: "Fixação cirúrgica de fragmentos ósseos fraturados utilizando implantes como placas, parafusos, hastes ou fios." },
  { term: "Pseudoartrose", definition: "Falha na consolidação de uma fratura após o tempo esperado, resultando em uma 'falsa articulação' no local da quebra." },
  { term: "Consolidação Viciosa", definition: "Ocorre quando o osso fraturado consolida (cola) em uma posição anatômica incorreta ou desalinhada." },
  { term: "Luxação", definition: "Deslocamento completo e persistente das superfícies ósseas que compõem uma articulação." },
  { term: "Subluxação", definition: "Deslocamento parcial ou incompleto das superfícies articulares." },
  { term: "Entorse", definition: "Lesão traumática dos ligamentos de uma articulação, causada por um movimento brusco, sem que haja deslocamento permanente dos ossos." },
  { term: "Tenorrafia", definition: "Sutura cirúrgica de um tendão rompido." },
  { term: "Miorrafia", definition: "Sutura cirúrgica de um músculo lesionado." },
  { term: "Osteotomia", definition: "Corte cirúrgico planejado de um osso para corrigir deformidades ou alterar o eixo de carga." },
  { term: "Epifisiodese", definition: "Procedimento para fundir prematuramente a placa de crescimento (fise) para corrigir discrepâncias de comprimento dos membros." },
  { term: "Debridamento", definition: "Remoção cirúrgica de tecidos desvitalizados, infectados ou necróticos de uma ferida ou osso." },
  { term: "Redução", definition: "Manobra para reposicionar ossos fraturados ou articulações luxadas em sua posição anatômica normal." },
  { term: "Valgo", definition: "Deformidade onde o segmento distal do membro se desvia para fora em relação à linha média (ex: joelhos em X)." },
  { term: "Varo", definition: "Deformidade onde o segmento distal do membro se desvia para dentro em relação à linha média (ex: pernas em alicate)." },
  { term: "Diáfise", definition: "A parte central ou corpo de um osso longo." },
  { term: "Epífise", definition: "As extremidades dos ossos longos, que participam das articulações." },
  { term: "Metáfise", definition: "Zona de transição entre a diáfise e a epífise, onde ocorre o crescimento ósseo em crianças." },
  { term: "Fise", definition: "Placa de crescimento cartilaginosa localizada entre a metáfise e a epífise." },
  { term: "Escoliose", definition: "Deformidade tridimensional da coluna vertebral, caracterizada por um desvio lateral superior a 10 graus." },
  { term: "Cifose", definition: "Curvatura da coluna vertebral com concavidade anterior (corcunda), comum na região torácica." },
  { term: "Lordose", definition: "Curvatura da coluna vertebral com concavidade posterior, normal nas regiões cervical e lombar." },
  { term: "Hérnia de Disco", definition: "Deslocamento do disco intervertebral que pode comprimir nervos da coluna, causando dor e dormência." },
  { term: "Tendinite", definition: "Inflamação ou irritação de um tendão, geralmente causada por esforço repetitivo ou trauma." },
  { term: "Bursite", definition: "Inflamação da bursa (bolsa sinovial), que atua como amortecedor entre ossos e tecidos moles." },
  { term: "Fascite Plantar", definition: "Inflamação da fáscia plantar, tecido que liga o calcanhar aos dedos do pé, causando dor na sola." },
  { term: "Síndrome do Túnel do Carpo", definition: "Compressão do nervo mediano no punho, resultando em dor, formigamento e fraqueza na mão." },
  { term: "Gota", definition: "Tipo de artrite causada pelo acúmulo de cristais de ácido úrico nas articulações, gerando dor intensa e inchaço." },
  { term: "Artrite Reumatoide", definition: "Doença autoimune crônica que causa inflamação, dor e deformidade nas articulações." },
  { term: "Osteoartrite", definition: "Desgaste progressivo da cartilagem articular, também conhecida como artrose ou doença articular degenerativa." },
  { term: "Meniscectomia", definition: "Remoção cirúrgica parcial ou total de um menisco lesionado no joelho." },
  { term: "Ligamentoplastia", definition: "Cirurgia de reconstrução de um ligamento rompido, frequentemente utilizando enxertos." },
  { term: "Sinovite", definition: "Inflamação da membrana sinovial, que reveste as articulações e produz o líquido lubrificante." },
  { term: "Capsulite Adesiva", definition: "Também conhecida como 'ombro congelado', é a inflamação e rigidez da cápsula articular do ombro." },
  { term: "Epicondilite", definition: "Inflamação dos tendões que se inserem no cotovelo (lateral: 'cotovelo de tenista'; medial: 'cotovelo de golfista')." },
  { term: "Osteomielite", definition: "Infecção no osso, geralmente causada por bactérias que chegam via corrente sanguínea ou trauma exposto." },
  { term: "Necrose Avascular", definition: "Morte do tecido ósseo devido à interrupção do suprimento sanguíneo, comum na cabeça do fêmur." },
  { term: "Displasia do Quadril", definition: "Desenvolvimento anormal da articulação do quadril, onde a cabeça do fêmur não se encaixa bem no acetábulo." },
  { term: "Hallux Valgus", definition: "Deformidade popularmente conhecida como 'joanete', caracterizada pelo desvio do dedão do pé para fora." }
];

const DAILY_TASKS = [
  { id: 0, time: "07:00", task: "INÍCIO: Ligar computadores, checar PS Orto (higienização/fichas) e pedir kit curativo/instrumental.", done: false, alert: true },
  { id: 2.5, time: "07:30", task: "Quarta/Quinta: Perguntar para a secretaria qual chefe da anestesia está hoje.", done: false, alert: true },
  { id: 3, time: "08:00", task: "Passar vendo altas do particular.", done: true },
  { id: 4, time: "10:00", task: "Avisar CME para buscar material no Curativo.", done: false },
  { id: 5, time: "11:00", task: "MAPA: Printar Mapa Cirúrgico (Salas D e K) e mandar pro R4. Formalizar pedidos.", done: false, alert: true },
  { id: 5.5, time: "12:00", task: "ALMOÇO: Intervalo de 1 hora (Retorno às 13:00).", done: false, alert: true },
  { id: 7, time: "13:00", task: "RETORNO: Pedir kit curativo e bacia novamente (se necessário).", done: false },
  { id: 6, time: "13:15", task: "REGULAÇÃO/NIR: Mandar mapa + UTI (vagas) + Equipes de amanhã para Regulação/NIR.", done: false, alert: true },
  { id: 8, time: "14:00", task: "INTERNAÇÕES: Confirmar pacientes e avisar Claudirene (liberações cirúrgicas).", done: false, alert: true },
  { id: 10, time: "14:30", task: "VAGAS: Verificar mapa de amanhã e avisar Jéssica (apartamentos se convênio particular).", done: false },
  { id: 10.5, time: "15:00", task: "BATER MAPA (SUS/Convênio): Informar internações de amanhã para as especialidades.", done: false, alert: true, highlight: true },
  { id: 11, time: "15:15", task: "Rotina Administrativa: Notas fiscais e documentação do particular no livro.", done: false },
  { id: 13, time: "15:30", task: "FECHAMENTO: Contar atendimentos, guias e curativos. Alimentar planilha e Alta GSUS.", done: false, alert: true, highlight: true },
  { id: 14, time: "16:00", task: "FIM DO EXPEDIENTE: Entregar pasta GSUS na recepção e desligar computadores.", done: false },
  { id: 15, time: "Seg/Sex", task: "Segunda: Pegar tesouras / Sexta: Devolver tesouras.", done: false },
  { id: 16, time: "Terça", task: "RESIDENTES: Carimbar guias (Lucas, Marcelo, Juan, Barbara) - Dividir por 4.", done: false, alert: true },
  { id: 17, time: "Mão", task: "DIA DA MÃO: Carimbar com nome do Preceptor + Terapeuta Ocupacional (Curativo/Atendimento).", done: false, alert: true },
];

const getTimePriority = (time: string) => {
  if (time.includes(':')) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
  const priorities: Record<string, number> = {
    "Tarde": 1000,
    "Rotina": 2000,
    "Final do Dia": 3000,
    "Segunda/Sexta": 4000
  };
  return priorities[time] || 5000;
};

const WEEKLY_ROUTINE = [
  { day: "Segunda-feira", tasks: ["Ir com técnico no PS para deixar organizado (não olham no FDS).", "Pegar tesouras (comum e de cortar gesso).", "OPME: Repassar as fraturas de final de semana para dar saída de sala."] },
  { day: "Terça-feira", tasks: ["Pedir almoxarifado (pela manhã).", "Pedido da Orto ambulância (materiais de escritório)."] },
  { day: "Quarta-feira", tasks: [] },
  { day: "Quinta-feira", tasks: ["Pedir instrumental antes das 20:00 (muito utilizado neste dia)."] },
  { day: "Sexta-feira", tasks: ["Pedir almoxarifado (pela manhã).", "Devolver tesouras."] }
];

const PROTOCOLS = [
  {
    category: "Regras Médicas & Equipe",
    icon: <Users className="w-5 h-5 text-blue-500" />,
    items: [
      { title: "Dr. Eduardo (CC)", desc: "Não quer nada abreviado. Não coloca o lado da operação no mapa. Material em anexo e salvo." },
      { title: "Drª Marcela", desc: "Mão e microcirurgia. Mandar guia inicial por causa do material pedido para conferência." },
      { title: "Dr. Ivan (Mão)", desc: "A enfermeira Flávia cuida da agenda dele. Pode antecipar cirurgia. Espera de 3 a 4 cirurgias no dia (na especialidade de mão, o máximo são 5 cirurgias)." },
      { title: "R4 (Plantão PS)", desc: "Define mapa da pediátrica e reconstrução de quadril. Ajusta medicações em caso de discrepância." },
      { title: "Atendimento R4 (Particular)", desc: "R4 atende no particular só convênio. O particular mesmo (que paga em dinheiro) vai para o médico responsável da especialidade." },
      { title: "Enfª Joice", desc: "Monta mapa com residentes. Marca data para cirurgias particulares." },
      { title: "Equipe Técnica", desc: "Lança curativos e altas no sistema." },
      { title: "Higienização das Mãos", desc: "Acompanhar equipe técnica para ver higienização das mãos." },
      { title: "Amanda (Menor Aprendiz)", desc: "Menor aprendiz da equipe. Trabalha das 08:00 às 12:00." },
      { title: "Escala do PS", desc: "Montada por um app separado dos médicos. Dr. Erick é o chefe. Enfª Joice tem acesso." },
      { title: "Dr. Bernardo", desc: "Geralmente se pergunta qual dos médicos vai operar antes. O paciente dele passa o print da liberação de risco cirúrgico para ele. A ouvidoria vem no setor." },
      { title: "Ordem de Contato", desc: "Primeiro falar com a Roseli e depois com a Sueli." },
      { title: "Segurança", desc: "O nome do segurança é Maicon." },
      { title: "Ouvidoria", desc: "A ouvidora do hospital é a Jaque." }
    ]
  },
  {
    category: "Mapa Cirúrgico & Logística",
    icon: <Activity className="w-5 h-5 text-emerald-500" />,
    items: [
      { title: "Pediátrica", desc: "Prioridade pediátrica e por idade. Sempre começar pela menor idade. Verificar se o mapa está errado. Jejum para menor é prejudicial." },
      { title: "Observações do Mapa", desc: "NUNCA tirar a observação do mapa cirúrgico (médico que coloca). Mandar foto da obs pro médico para complementar." },
      { title: "Solicitação de Sangue", desc: "Obrigatório para cirurgias de alta complexidade (Próteses de joelho/quadril, revisões e fraturas de fêmur). Sempre confirmar a necessidade com o cirurgião responsável." },
      { title: "Logística de Coleta (Sangue)", desc: "Pacientes internados: coleta no mesmo dia. Internação no dia seguinte (Convênio/Particular): enviar info para Jéssica (gestora/enfermeira) organizar a RT. Internação no dia seguinte (SUS): enviar para Eliane na enfermaria." },
      { title: "Vagas de UTI", desc: "Monitorar a necessidade, pois a confirmação depende da liberação do risco cirúrgico. É obrigatório pontuar e formalizar no mapa cirúrgico quantas vagas de UTI foram solicitadas." },
      { title: "Risco Cirúrgico", desc: "Realizado pelo cardiologista e pelo anestesista. A informação deve ser repassada ao anestesista no momento da entrega do mapa (Avisar a Cris e o chefe da anestesia)." },
      { title: "Raio-X", desc: "Alinhar com o responsável pelo setor sobre a disponibilidade de horários e informar especificamente qual parte do corpo precisará da imagem." },
      { title: "Comunicação do Mapa", desc: "O mapa cirúrgico e o OPME devem ser compartilhados com a equipe médica, residentes, regulação e setores de apoio." },
      { title: "Bater Mapa (SUS/Convênio)", desc: "Lembrar e reforçar que devemos bater o mapa com o pessoal do SUS e Convênio dos pacientes que irão internar um dia antes para informar a elas quem será." },
      { title: "Cancelamento de Cirurgia", desc: "Quando o Dr. não atende, devemos cancelar a cirurgia." },
      { title: "OPME", desc: "Fio de Kischner 2.0 + 2.5. Caixas outros vão na caixa OPME. Código para itens OPME: 47716. Código para caixa de OPME: 13. Fornecedor: SUS pode ser mais de um. Para marcar cirurgia com material, pedir OPME por e-mail." },
      { title: "Equipamentos Específicos", desc: "Toda cirurgia de mão vai caixa de mão, e dependendo uma cirurgia de plexo inclui uma caixa de micro. Intensificador de imagem e perfurador só em cirurgias que vão material de síntese." },
      { title: "Ícone Paciente Deitado", desc: "Quando aparece o ícone de paciente deitado no mapa cirúrgico, significa que ele já está internado. Ligar no setor e avisar." },
      { title: "Mesa de Tração", desc: "Quando estiver na observação, colocar na descrição da cirurgia." },
      { title: "UTI de Dois Lados", desc: "Verificar se tem UTI de dois lados, senão o paciente não aparece no mapa." }
    ]
  },
  {
    category: "Rotinas Administrativas",
    icon: <FileText className="w-5 h-5 text-purple-500" />,
    items: [
      { title: "Atendimento Telefônico", desc: "Atender sempre como: 'Ortopedia e Traumatologia'." },
      { title: "Guias Convênio/Unimed", desc: "Acompanhar desde o início. Colocar CID, carimbo do médico e solicitação para montar guia da Unimed." },
      { title: "Pendência de Guia", desc: "Pendência de guia sem carimbar do particular fica com a Tati." },
      { title: "Infiltração do Convênio", desc: "Acompanhar solicitações e guias de infiltração pelo convênio." },
      { title: "Consultas SUS", desc: "59 consultas/dia para especialidade SUS (pode ser 59 manhã e 59 tarde). Chamar 1 por vez para não tumultuar no corredor." },
      { title: "Prontuários Pendentes", desc: "Ficam na pasta AZUL perto do computador." },
      { title: "Intercorrências", desc: "Paciente NÃO pode saber das intercorrências." },
      { title: "Lista do Centro Cirúrgico", desc: "Imprimir a lista do dia para levar pro CC. Guardar uma cópia no próprio WhatsApp." },
      { title: "Listas NGC/SUS", desc: "Contabilizar e entregar as listas com NGC/SUS para a Luci." },
      { title: "Atestados", desc: "Quando o paciente aguarda atestado, devemos acionar o médico do PS." },
      { title: "Embalagens de Medicação", desc: "Guardar a embalagem da medicação por 30 dias (especialmente de infiltração) por questões da Anvisa." },
      { title: "Itens do Consultório", desc: "Tirar coisas do consultório e colocar na mesa da moça do particular." },
      { title: "Guias e Convênios", desc: "Convênio Angeli: pode solicitar revalidação. Outros convênios: pedir na central de guias (falar com Regiane). Respeitar a validade da Guia (pode perder tempo hábil da cirurgia se demorar > 21 dias). Importante: Anotar a reserva do leito. Pediu a guia, pare tudo e faça pra não ficar sob sua responsabilidade." },
      { title: "Contato Pré-operatório", desc: "Entrar em contato com o paciente para perguntar se já consultou com o médico anestesista, se já realizou os exames e informar a data." },
      { title: "Guias de Atendimento (Particular)", desc: "Colocar guias de atendimento na mesa do médico por horário. Guia do Paraná Clínicas: colocar na mesa caso ele atenda algum convênio. Ex: Bernardo e Karoline são duas salas particular e cada um fica em uma." },
      { title: "Atendimento R4 (Particular)", desc: "R4 atende no particular só convênio. O particular mesmo (que paga em dinheiro) vai para o médico responsável da especialidade." },
      { title: "Documentação e Fichas", desc: "Documentar o particular no livro do particular/convênio guias de hoje e todos assinam. Levar as fichas do Convênio na recepção central 3 (recepcionista). As fichas ficam na SCIH do SUS para verificar se tem doença." },
      { title: "Estatísticas e Planilha", desc: "Contar dia a dia: retorno na vaga, pós-operatório, eletivo, inicial, falta inicial, retorno ambulatório, retorno PS e interconsulta. Marcar semanalmente para alimentar a tabela SUS e convênio. Contar consulta de PS no livro a partir da semana designada na tabela (ex: os 41 que voltaram para retorno e pacientes que passaram pelo PS se irão retornar ambulatorial)." },
      { title: "Planilha do Drive (Cirurgias Eletivas)", desc: "São cirurgias eletivas que aguardam vaga do SUS. Só se sabe que a vaga saiu quando o médico chama para fazer o procedimento." },
      { title: "Laudos de RX (Convênio)", desc: "No Tasy (exames complementares), retirar o laudo do RX e mandar na central de guias junto com a guia da cirurgia. Somente para convênio." }
    ]
  },
  {
    category: "Estrutura & Contatos",
    icon: <Phone className="w-5 h-5 text-orange-500" />,
    items: [
      { title: "Contatos-Chave: Coletas e Internação", desc: "Jéssica: Gestora de convênios/Enfermeira (coletas de convênio). Eliane: Enfermaria (coletas SUS). Juliane: Internamento (sabe de todas as internações previstas). Claudia Irene: Setor do CAP. Regiane: Central de Guias. Tati: Atestados de acompanhante pro particular." },
      { title: "Ramais Importantes", desc: "Ramal 8159. Ordem 138662 (PS) / Ordem 138664." },
      { title: "Infiltração Articular", desc: "Particular, no balcão. Dr. Pedro e Dr. Marco ligam no ramal." },
      { title: "Sala de Curativo", desc: "2 macas disponíveis. As pinças ficam guardadas embaixo da maca. Utilizar kit instrumental 3, 2 e 5." },
      { title: "Consultórios", desc: "4 consultórios médicos. Consultório 2: mini caixa de emergência (metal). Consultório 4: armário desativado." },
      { title: "Carimbo e Tesouras", desc: "O carimbo fica na 3ª gaveta em uma caixa. As tesouras (comum e de cortar gesso) devem ser pegas na segunda e devolvidas na sexta." },
      { title: "Clínica Ortopédica", desc: "A Clínica Ortopédica funciona como pronto-socorro." }
    ]
  },
  {
    category: "Atendimento & Consultório",
    icon: <Users className="w-5 h-5 text-indigo-500" />,
    items: [
      { title: "Chamada de Pacientes", desc: "Chamar paciente do particular pelo nome (pessoalmente). Paciente SUS pode ser chamado no sistema (chamar 1 por vez para não tumultuar o corredor)." },
      { title: "Pós-Operatório (Particular)", desc: "Chamar o paciente de Pós OP pessoalmente quando vem pelo particular." },
      { title: "Interação com Médico", desc: "Trazer o carimbo do médico. Mostrar a cirurgia pro médico se ele estiver de plantão." },
      { title: "Atestados (Particular)", desc: "A Tati faz atestado de acompanhante pro particular." }
    ]
  },
  {
    category: "Sala de Curativo & Procedimentos",
    icon: <Activity className="w-5 h-5 text-rose-500" />,
    items: [
      { title: "Higienização", desc: "Higienizar a sala a cada paciente." },
      { title: "Evolução no Tasy", desc: "Pedir computador, carrinho ou notebook com acesso ao Tasy para evoluir retirada de pontos na sala de curativo. Texto padrão para evolução: 'Orto - tala e gesso' ou 'retiradas'. Usar 'AT' para encontrar o paciente." },
      { title: "Infiltração", desc: "Dr. Luiz faz infiltração deitado. Ácido hialurônico: guardar a embalagem por 30 dias." },
      { title: "Materiais Infiltração (Plano B)", desc: "Separar: 6 seringas de 10ml com rosca, 3 seringas de 20ml com rosca, 1 cuba rim, 1 cubinha, 1 campo de bersale, 2 xylocaina injetável, 2 luvas 7.5, 10 gazes, Caixa de Luva M, 5 agulhas 40x12, 5 agulhas 25x0.7 e 4 agulhas 13x4.5." },
      { title: "Torneirinha de 3 Vias", desc: "Para infiltração, pedir na requisição de medicamentos dentro da farmácia dispensação (código 119)." },
      { title: "Lesão em MSD (Antebraço)", desc: "Manter em repouso com a mão para cima." },
      { title: "Reabilitação", desc: "Pacientes fazem reabilitação com a terapeuta ocupacional." }
    ]
  },
  {
    category: "Almoxarifado & Materiais",
    icon: <ClipboardList className="w-5 h-5 text-teal-500" />,
    items: [
      { title: "Malha Tubular", desc: "A malha tubular de 6 cm é utilizada especificamente para crianças." },
      { title: "Clorexidina e Álcool 70%", desc: "Devem ser pedidos separados no almoxarifado." },
      { title: "Luvas", desc: "O pedido de luvas no almoxarifado é feito por unidade (ex: para uma caixa com 100 luvas, deve-se pedir 100 unidades)." },
      { title: "Orto Ambulância", desc: "Pedidos de materiais de escritório (Orto ambulância) devem ser realizados na terça-feira." },
      { title: "Atadura Ortopédica", desc: "Abrir com estilete nº 22." }
    ]
  },
  {
    category: "Orçamentos & Agendamentos",
    icon: <Calendar className="w-5 h-5 text-indigo-500" />,
    items: [
      { title: "Confirmação de Internação", desc: "Mandar mensagem confirmando um dia antes (se opera segunda, mandar na sexta). SUS: Se desistir, vai para o final da fila (eletivo) ou vira abandono (fratura). Particular: Ideal desistir com 1 semana de antecedência (devido à reserva de material e autoclave), limite máximo de 72 horas." },
      { title: "Transcrição de Guias", desc: "Transcrever as guias do médico na hora de agendar, colocando motivo, CID e materiais em guia física." },
      { title: "Guias do Dr. Angeli", desc: "Se no momento que a paciente quis operar ela não tinha condições clínicas e foi dado outro raio-x, transcrever a guia e verificar se pede o mesmo material (às vezes muda o fornecedor)." },
      { title: "Materiais e Fornecedores", desc: "A Orthomed tem a fresa. Confirmar orçamento apenas quando o paciente perguntar." },
      { title: "Agendamento de Cirurgia/Consulta", desc: "WhatsApp: (41) 998201199. Horário: 08:00 às 16:00 (Segunda a Sexta). Também pode ser feito presencialmente. Alguns médicos têm autonomia para marcar a própria cirurgia. Lembre-se: marcar cirurgia e pedir OPME sempre por e-mail." },
      { title: "Pedidos de Prótese", desc: "Pedidos de prótese do R4 (ex: Eder) ou Dr. Juan geralmente são agendados para quarta-feira." },
      { title: "Consulta Online", desc: "O valor da consulta online é de R$ 200,00." },
      { title: "Aviso de Consulta", desc: "Avisar o paciente sobre a consulta com 5 dias de antecedência." },
      { title: "Orçamento Social", desc: "Opção para pacientes que não querem aguardar a fila do SUS." },
      { title: "Chegada de Orçamento", desc: "Assim que chegar o orçamento, perguntar imediatamente ao médico quando deseja marcar a cirurgia." },
      { title: "Regulação SUS (CAP)", desc: "O CAP é o centro de regulação que manda todo o processo de auditoria para o SUS." }
    ]
  },
  {
    category: "Orientações ao Paciente",
    icon: <Info className="w-5 h-5 text-teal-500" />,
    items: [
      { title: "Cuidados com Curativo", desc: "NUNCA lavar o curativo no banho na hora de orientar o paciente da Ortopedia." }
    ]
  },
  {
    category: "Avaliação Pré-Anestésica",
    icon: <Activity className="w-5 h-5 text-cyan-500" />,
    items: [
      { title: "Obrigatoriedade", desc: "Todos os pacientes de convênio e particular passam por anestesista." },
      { title: "Carta de Avaliação", desc: "A carta nós que fazemos, porém tem que ser obrigatoriamente do Hospital." },
      { title: "Agendamento e Valor", desc: "A avaliação pré-anestésica é feita no dia do atendimento. O valor da consulta é de R$ 250,00." }
    ]
  },
  {
    category: "Escala de Horários (Almoço)",
    icon: <Clock className="w-5 h-5 text-rose-500" />,
    items: [
      { title: "Horários Padrão", desc: "Rute: 11:00 | Gilberto: 12:00 | Carol: 13:00" },
      { title: "Quarta-feira", desc: "Dois funcionários saem juntos às 12:00." }
    ]
  },
  {
    category: "POP - Procedimentos por Especialidade",
    icon: <Activity className="w-5 h-5 text-indigo-500" />,
    items: [
      { title: "Mão e Microcirurgia", desc: "Dr. Ivan e Dra. Marcela. Máximo de 5 cirurgias por dia na especialidade. Enviar guia inicial para conferência de material." },
      { title: "Pediátrica e Reconstrução", desc: "Dr. Erick e Dra. Ana Paula. Prioridade no mapa cirúrgico (por idade, menor primeiro). Jejum prolongado é prejudicial." },
      { title: "Quadril e Joelho", desc: "Dr. Juan, Dr. Bernardo, Dra. Barbara, Dr. Lucas. Cirurgias de alta complexidade (próteses, revisões, fraturas de fêmur) exigem solicitação de sangue e reserva de UTI." },
      { title: "Pé e Tornozelo", desc: "Dr. Mario, Dr. Juliano M., Dr. Augusto. (Procedimentos específicos a definir)." },
      { title: "Ombro", desc: "Dr. Juliano Santini. (Procedimentos específicos a definir)." },
      { title: "Tumor Ósseo", desc: "Dr. João Pedro Motter. (Procedimentos específicos a definir)." }
    ]
  },
  {
    category: "POP - Padrão Curativos",
    icon: <Syringe className="w-5 h-5 text-rose-500" />,
    items: [
      { title: "Preparação da Sala", desc: "2 macas disponíveis. Higienizar a sala a cada troca de paciente." },
      { title: "Kits e Instrumentais", desc: "Utilizar kit instrumental 3, 2 e 5. As pinças ficam guardadas embaixo da maca." },
      { title: "Solicitação e Devolução", desc: "Pedir kit curativo, bacia e instrumental às 07:00. Avisar CME para buscar material às 10:00 (eles pegam às 14:00)." },
      { title: "Evolução no Sistema (Tasy)", desc: "Pedir computador/carrinho com Tasy. Texto padrão: 'Orto - tala e gesso' ou 'retiradas'. Usar 'AT' para encontrar o paciente." },
      { title: "Orientações ao Paciente", desc: "NUNCA orientar o paciente da Ortopedia a lavar o curativo no banho." }
    ]
  }
];

const MAPAS_ESPECIALIDADES = [
  { id: 'seg_joelho', name: 'Joelho (Segunda) - Dr. Juan Capriotti' },
  { id: 'seg_pe', name: 'Pé (Segunda) - Dr. Mario / Dr. Juliano M. / Dr. Augusto' },
  { id: 'ter_quadril', name: 'Quadril (Terça) - Dra. Barbara / Dr. Lucas' },
  { id: 'ter_tumor', name: 'Tumor Ósseo (Terça) - Dr. João Pedro Motter' },
  { id: 'qua_ombro', name: 'Ombro (Quarta) - Dr. Juliano Santini Gerlack' },
  { id: 'qua_pediatrica', name: 'Pediátrica (Quarta) - Dr. Erick / Dra. Ana Paula' },
  { id: 'qua_reconstrucao', name: 'Reconstrução (Quarta) - Dr. Erick / Dra. Ana Paula' },
  { id: 'qui_mao', name: 'Mão (Quinta) - Dr. Ivan / Dra. Marcela' },
  { id: 'sex_joelho', name: 'Joelho (Sexta) - Dr. Bernardo Damian' },
  { id: 'sex_quadril', name: 'Quadril (Sexta) - Dra. Barbara / Dr. Lucas' },
  { id: 'sex_pe', name: 'Pé (Sexta) - Dr. Mario / Dr. Juliano M. / Dr. Augusto' }
];

const PRECEPTORES = [
  { doctor: "Dr. Juan Capriotti (Chefe da Ortopedia)", specialty: "Joelho", time: "Segunda de manhã" },
  { doctor: "Dr. Mario / Dr. Juliano M. / Dr. Augusto", specialty: "Pé e Tornozelo", time: "Segunda-feira" },
  { doctor: "Dra. Barbara / Dr. Lucas", specialty: "Quadril", time: "Terça-feira" },
  { doctor: "Dr. João Pedro Motter", specialty: "Tumor Ósseo", time: "Terça-feira" },
  { doctor: "Dr. Juliano Santini Gerlack", specialty: "Ombro", time: "Quarta-feira" },
  { doctor: "Dr. Erick / Dra. Ana Paula", specialty: "Pediátrica e Reconstrução", time: "Quarta-feira" },
  { doctor: "Dr. Juan Capriotti (Chefe da Ortopedia)", specialty: "Atendimento", time: "Quarta de tarde" },
  { doctor: "Dr. Ivan / Dra. Marcela", specialty: "Mão e Microcirurgia", time: "Quinta-feira" },
  { doctor: "Dr. Bernardo Damian", specialty: "Joelho", time: "Sexta-feira" },
  { doctor: "Dra. Barbara / Dr. Lucas", specialty: "Quadril", time: "Sexta-feira" },
  { doctor: "Dr. Mario / Dr. Juliano M. / Dr. Augusto", specialty: "Pé e Tornozelo", time: "Sexta-feira" }
];

const ROTEIRO_STEPS = [
  {
    id: 1,
    title: "1. Início do Expediente (Manhã)",
    icon: <Sun className="w-6 h-6 text-amber-500" />,
    color: "bg-amber-50 border-amber-100",
    textColor: "text-amber-800",
    items: [
      "Ligue os computadores (Senha: orto123).",
      "Às 07:00: Peça kit curativo, bacia e instrumental (adicione conjuntos na requisição).",
      "Passe vendo as altas do particular.",
      "Organize as guias de atendimento na mesa dos médicos por horário (ex: Paraná Clínicas).",
      "Terça e Sexta-feira: Pedir almoxarifado pela manhã.",
      "Terça-feira: Fazer pedido da Orto ambulância (materiais de escritório)."
    ]
  },
  {
    id: 2,
    title: "2. Atendimento no Consultório",
    icon: <Users className="w-6 h-6 text-blue-500" />,
    color: "bg-blue-50 border-blue-100",
    textColor: "text-blue-800",
    items: [
      "Telefone: Atenda sempre dizendo 'Ortopedia e Traumatologia'.",
      "Particular: Chame o paciente pelo nome, indo pessoalmente. Pós-OP também é chamado pessoalmente.",
      "SUS: Chame pelo sistema, mas atenção: chamar 1 por vez para não tumultuar o corredor.",
      "Médicos: Leve o carimbo até eles. Se o médico estiver de plantão, mostre a cirurgia para ele."
    ]
  },
  {
    id: 3,
    title: "3. Fluxo de Cirurgias e OPME",
    icon: <ClipboardList className="w-6 h-6 text-emerald-500" />,
    color: "bg-emerald-50 border-emerald-100",
    textColor: "text-emerald-800",
    items: [
      "Pedido de Guia: O médico pediu? Pare tudo e faça a guia para não ficar sob sua responsabilidade.",
      "OPME: Peça o material por e-mail. Fios de Kischner 2.0 e 2.5 vão na caixa OPME. Código itens OPME: 47716. Código caixa OPME: 13.",
      "Sangue: Obrigatório para alta complexidade (próteses, fêmur). Paciente internado = coleta hoje. Interna amanhã = avise Jéssica (Convênio) ou Eliane (SUS).",
      "UTI e Risco: Anote no mapa se precisa de UTI. Avise a Cris e o chefe da anestesia sobre o risco cirúrgico.",
      "Prazos do Mapa: 11:00 printar e mandar pro R4. 12:40 mandar para OPME e Regulação."
    ]
  },
  {
    id: 4,
    title: "4. Sala de Curativo e Procedimentos",
    icon: <Syringe className="w-6 h-6 text-rose-500" />,
    color: "bg-rose-50 border-rose-100",
    textColor: "text-rose-800",
    items: [
      "Higienização: Limpe a sala a cada troca de paciente.",
      "Evolução (Tasy): Peça um computador/carrinho. Use o texto 'Orto - tala e gesso' ou 'retiradas'. Busque o paciente por 'AT'.",
      "Infiltração: Guarde a embalagem do ácido hialurônico por 30 dias (Anvisa). Dr. Luiz faz o procedimento com o paciente deitado.",
      "CME: Avise às 10:00 para buscarem os materiais (eles passam recolhendo às 14:00)."
    ]
  },
  {
    id: 5,
    title: "5. Fim do Expediente",
    icon: <Moon className="w-6 h-6 text-indigo-500" />,
    color: "bg-indigo-50 border-indigo-100",
    textColor: "text-indigo-800",
    items: [
      "Recolha a pasta GSUS (alta) e entregue na recepção do SUS.",
      "Desligue TODOS os computadores antes de sair (Senha: orto123).",
      "Sexta-feira: Lembre-se de devolver as tesouras (comum e de gesso)."
    ]
  }
];

// --- COMPONENTS ---

const CollapsibleProtocolItem: React.FC<{ item: { title: string, desc: string }, collapseSignal: number }> = ({ item, collapseSignal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (collapseSignal > 0) {
      setIsExpanded(false);
    }
  }, [collapseSignal]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.desc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${isExpanded ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800 shadow-md ring-1 ring-blue-50 dark:ring-blue-900/20' : 'bg-white/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700/50 hover:border-blue-100 dark:hover:border-blue-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'}`}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex justify-between items-center focus:outline-none group p-4"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`text-sm md:text-base font-bold transition-colors ${isExpanded ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
              {item.title}
            </h4>
            {isExpanded && <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Protocolo Ativo</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button 
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
              title="Copiar Protocolo"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            className={`p-1.5 rounded-full transition-colors ${isExpanded ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-700'}`}
          >
            <ChevronDown className="w-4 h-4 shrink-0" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-0">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {item.desc}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [popCollapseSignal, setPopCollapseSignal] = useState(0);
  const [sigtapSearchQuery, setSigtapSearchQuery] = useState('');
  const [techTermsSearchQuery, setTechTermsSearchQuery] = useState('');
  const [dailyTasks, setDailyTasks] = useState(DAILY_TASKS);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskValue, setEditingTaskValue] = useState({ task: '', time: '' });
  const [mapChecklist, setMapChecklist] = useState(MAPAS_ESPECIALIDADES.map(s => ({ ...s, done: false })));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportTasks = () => {
    const dataStr = JSON.stringify(dailyTasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rotina_ortomanage_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setDailyTasks(json);
          alert('Rotina importada com sucesso!');
        } else {
          alert('Arquivo JSON inválido.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEditing = (task: any) => {
    setEditingTaskId(task.id);
    setEditingTaskValue({ task: task.task, time: task.time });
  };

  const saveEdit = () => {
    if (editingTaskId !== null) {
      setDailyTasks(prev => prev.map(t => 
        t.id === editingTaskId 
          ? { ...t, task: editingTaskValue.task, time: editingTaskValue.time } 
          : t
      ));
      setEditingTaskId(null);
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
  };
  const [lastMapAdjustment, setLastMapAdjustment] = useState<Date | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const toggleMapCheck = (id: string) => {
    setMapChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
    setLastMapAdjustment(new Date());
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTask = (id: number) => {
    setDailyTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const addTask = (taskText: string, time: string = "Rotina") => {
    const newTask = {
      id: Date.now(),
      time,
      task: taskText,
      done: false,
      alert: false
    };
    setDailyTasks(prev => [...prev, newTask]);
  };

  const deleteTask = (id: number) => {
    setDailyTasks(prev => prev.filter(t => t.id !== id));
  };

  const filteredProtocols = PROTOCOLS.map(section => {
    const sectionMatches = section.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const filteredItems = section.items.filter(item => 
      sectionMatches ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return { ...section, items: filteredItems };
  }).filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 transition-colors duration-300">
      {/* SIDEBAR (Desktop) / TOPBAR (Mobile) */}
      <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 md:h-[calc(100vh-2rem)] md:m-4 md:rounded-3xl shadow-sm z-10 overflow-hidden transition-colors duration-300">
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center md:block">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Activity className="text-white w-4 h-4 md:w-5 md:h-5" />
              </div>
              OrtoManage
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 hidden md:block font-medium">Ortopedia & Traumatologia</p>
          </div>
          <div className="md:hidden flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-50 dark:bg-slate-800 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
            </button>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="flex-1 py-6 hidden md:block overflow-y-auto">
          <ul className="space-y-2 px-4">
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Activity className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('mapa')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${activeTab === 'mapa' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <ClipboardList className={`w-5 h-5 ${activeTab === 'mapa' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> Mapa Cirúrgico
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('rotinas')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${activeTab === 'rotinas' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <CheckSquare className={`w-5 h-5 ${activeTab === 'rotinas' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> Rotinas Diárias
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('protocolos')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${activeTab === 'protocolos' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <BookOpen className={`w-5 h-5 ${activeTab === 'protocolos' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> Protocolos (POP)
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('roteiro')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${activeTab === 'roteiro' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Map className={`w-5 h-5 ${activeTab === 'roteiro' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> Roteiro Prático
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('preceptores')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${activeTab === 'preceptores' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Users className={`w-5 h-5 ${activeTab === 'preceptores' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> Preceptores
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('dicas')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${activeTab === 'dicas' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Lightbulb className={`w-5 h-5 ${activeTab === 'dicas' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> Dicas e Macetes
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('termos')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${activeTab === 'termos' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Book className={`w-5 h-5 ${activeTab === 'termos' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> Termos Técnicos
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('sigtap')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${activeTab === 'sigtap' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Search className={`w-5 h-5 ${activeTab === 'sigtap' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> SIGTAP SUS
              </button>

              <button 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm ${activeTab === 'ramais' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                onClick={() => setActiveTab('ramais')}
              >
                <Phone className={`w-5 h-5 ${activeTab === 'ramais' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} /> Ramais Úteis
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-slate-100/60 dark:border-slate-800/60 hidden md:block bg-slate-50/50 dark:bg-slate-800/50 m-4 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Códigos OPME</p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Centro de Custo</span>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md tracking-widest">527</span>
          </div>
          <div className="bg-white dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Itens OPME</span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">47716</span>
          </div>
          <div className="bg-white dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Caixa OPME</span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">13</span>
          </div>
          
          <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-2"></div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-200/60 dark:border-blue-800/60 rounded-xl p-3 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="bg-blue-600 dark:bg-blue-500 text-white p-1.5 rounded-lg shadow-sm">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Ramal do Setor</p>
                <p className="text-lg font-black text-slate-800 dark:text-white leading-none">8159</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pl-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Enf. Joice</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Comercial: <span className="text-slate-900 dark:text-white">Eliane, Samuel, Janaína</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-blue-500 dark:bg-blue-600 border border-blue-600 dark:border-blue-500"></div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pasta Pendências</p>
          </div>

          <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-2"></div>

          <a 
            href="http://137.131.212.177:3001/api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm group mt-2"
          >
            <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">Acessar Sistema API</span>
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden pb-16 md:pb-0 relative">
        {/* HEADER (Desktop only) */}
        <header className="bg-transparent h-20 hidden md:flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent capitalize tracking-tight">
            {activeTab === 'mapa' ? 'Mapa Cirúrgico' : activeTab === 'roteiro' ? 'Roteiro Prático' : activeTab === 'preceptores' ? 'Preceptores' : activeTab === 'dicas' ? 'Dicas e Macetes' : activeTab === 'termos' ? 'Termos Técnicos' : activeTab === 'ramais' ? 'Ramais Úteis' : activeTab}
          </h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar paciente ou protocolo..." 
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all w-64 placeholder:text-slate-400 shadow-sm dark:text-white"
              />
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="relative p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full shadow-sm"
              title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="relative p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Mobile Header Title */}
        <div className="md:hidden bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-900 px-4 py-3 shrink-0 flex flex-col gap-2 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent capitalize tracking-tight">
              {activeTab === 'mapa' ? 'Mapa Cirúrgico' : activeTab === 'roteiro' ? 'Roteiro Prático' : activeTab === 'preceptores' ? 'Preceptores' : activeTab === 'dicas' ? 'Dicas e Macetes' : activeTab === 'termos' ? 'Termos Técnicos' : activeTab === 'ramais' ? 'Ramais Úteis' : activeTab}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Ramal Banner Mobile Sticky */}
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Ramal Setor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-blue-700 dark:text-blue-400">8159</span>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/50 px-1.5 py-0.5 rounded">Enf. Joice</span>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          
          {/* --- DASHBOARD VIEW --- */}
          {activeTab === 'dashboard' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 md:space-y-6 max-w-6xl mx-auto"
            >
              
              {/* OPME Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl shadow-md border border-transparent overflow-hidden text-white p-5 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  <div className="p-3 bg-white/20 rounded-xl shrink-0 hidden md:block">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 md:hidden" />
                      Códigos OPME Rápidos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm md:text-base text-emerald-50">
                      <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                        <strong className="text-white">Itens OPME</strong>
                        <span className="bg-white text-emerald-800 px-3 py-1 rounded-lg font-mono font-bold text-lg shadow-sm">47716</span>
                      </div>
                      <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                        <strong className="text-white">Caixa OPME</strong>
                        <span className="bg-white text-emerald-800 px-3 py-1 rounded-lg font-mono font-bold text-lg shadow-sm">13</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Avisos Importantes Banner */}
              <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl shadow-md border border-transparent overflow-hidden text-white p-5 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  <div className="p-3 bg-white/20 rounded-xl shrink-0 hidden md:block">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 md:hidden" />
                      Regra Importante: Avaliação Pré-Anestésica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-sm md:text-base text-cyan-50">
                      <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                        <strong className="block text-white mb-1">1. Obrigatoriedade</strong>
                        Todos os pacientes de Convênio e Particular passam por anestesista.
                      </div>
                      <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                        <strong className="block text-white mb-1">2. Carta de Avaliação</strong>
                        Nós que fazemos a carta, mas tem que ser obrigatoriamente do Hospital.
                      </div>
                      <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                        <strong className="block text-white mb-1">3. Agendamento e Valor</strong>
                        Feita no dia do atendimento. Valor da consulta: <span className="bg-white text-blue-800 px-2 py-0.5 rounded font-bold ml-1">R$ 250,00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regras de Internação Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-md border border-transparent overflow-hidden text-white p-5 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  <div className="p-3 bg-white/20 rounded-xl shrink-0 hidden md:block">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 md:hidden" />
                      Confirmação de Internação e Desistências
                    </h3>
                    <p className="text-indigo-100 text-sm md:text-base mb-4">
                      Sempre mandar mensagem para os pacientes confirmando a internação. Fique atento às regras de desistência:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm md:text-base text-indigo-50">
                      <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                        <strong className="block text-white mb-2 flex items-center gap-2"><Activity className="w-4 h-4"/> Pacientes SUS</strong>
                        <ul className="list-disc pl-4 space-y-1 text-indigo-100">
                          <li><strong className="text-white">Eletivo:</strong> Se desistir, vai para o final da fila.</li>
                          <li><strong className="text-white">Fratura:</strong> Se desistir, é considerado abandono.</li>
                        </ul>
                      </div>
                      <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                        <strong className="block text-white mb-2 flex items-center gap-2"><Calendar className="w-4 h-4"/> Particular / Convênio</strong>
                        <ul className="list-disc pl-4 space-y-1 text-indigo-100">
                          <li><strong className="text-white">Ideal:</strong> Desistir com no máximo 1 semana de antecedência (reserva de material/autoclave).</li>
                          <li><strong className="text-white">Limite:</strong> Até 72 horas antes.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                    <div className="p-2.5 md:p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl w-fit group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Users className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Consultas SUS</p>
                      <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white font-mono tracking-tight">0 <span className="text-sm md:text-base font-medium text-slate-400 dark:text-slate-500">/ 59</span></p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                    <div className="p-2.5 md:p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Activity className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Cirurgias</p>
                      <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white font-mono tracking-tight">{MOCK_SURGERIES.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                    <div className="p-2.5 md:p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl w-fit group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Pasta Azul</p>
                      <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white font-mono tracking-tight">0</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-700 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                    <div className="p-2.5 md:p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl w-fit group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <Syringe className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Coletas CME</p>
                      <p className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white font-mono tracking-tight">0</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Pendências não realizadas */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full">
                  <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 text-sm md:text-base">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" /> Pendências
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full">
                        {dailyTasks.filter(t => !t.done).length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-0 flex-1 flex flex-col overflow-y-auto max-h-[320px]">
                    {dailyTasks.filter(t => !t.done).length > 0 ? (
                      [...dailyTasks]
                        .filter(t => !t.done)
                        .sort((a, b) => getTimePriority(a.time) - getTimePriority(b.time))
                        .map(task => (
                        <div 
                          key={task.id} 
                          className="flex items-center gap-3 p-3.5 md:p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                        >
                          <button 
                            onClick={() => toggleTask(task.id)}
                            className="focus:outline-none"
                          >
                            <Circle className="w-4 h-4 md:w-5 md:h-5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors shrink-0" />
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                {task.time}
                              </span>
                              {task.alert && <AlertTriangle className="w-2.5 h-2.5 text-orange-500" />}
                            </div>
                            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium truncate">
                              {task.task}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('rotinas');
                                startEditing(task);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-blue-500 transition-all"
                              title="Editar tarefa"
                            >
                              <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                              title="Excluir tarefa"
                            >
                              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 flex-1">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                          <Check className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tudo em dia!</p>
                      </div>
                    )}
                  </div>

                  {/* Input area to "mold" the list */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const task = formData.get('task') as string;
                        const time = formData.get('time') as string;
                        if (task.trim()) {
                          addTask(task, time || "Rotina");
                          e.currentTarget.reset();
                        }
                      }}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          name="time"
                          type="text" 
                          placeholder="00:00"
                          className="w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[10px] md:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white shrink-0"
                        />
                        <input 
                          name="task"
                          type="text" 
                          placeholder="Nova pendência..."
                          className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-[10px] md:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                        />
                        <button 
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Quick Tasks */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                  <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 text-sm md:text-base">
                      <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-blue-500" /> Próximas Tarefas
                    </h3>
                    <button onClick={() => setActiveTab('rotinas')} className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">Ver todas</button>
                  </div>
                  <div className="p-0 flex-1 flex flex-col">
                    {[...dailyTasks]
                      .sort((a, b) => getTimePriority(a.time) - getTimePriority(b.time))
                      .slice(0, 5)
                      .map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-center gap-3 p-3.5 md:p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        onClick={() => toggleTask(task.id)}
                      >
                        {task.done ? (
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 md:w-5 md:h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <div className={`flex-1 ${task.done ? "opacity-50 line-through" : ""}`}>
                          <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{task.time}</span>
                          <span className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium">{task.task}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contatos Importantes */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 bg-orange-50/30 dark:bg-orange-900/10">
                  <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 text-sm md:text-base">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-orange-500" /> Coisas Importantes (Contatos & Ações)
                  </h3>
                </div>
                <div className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-200 transition-colors">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Regulação / NIR</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Mapa + UTI + Equipes</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Informar equipes de amanhã e vagas UTI</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-200 transition-colors">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Dia da Mão</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Carimbo Preceptor + TO</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Obrigatório em Curativo e Atendimento</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-200 transition-colors">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Salas Cirúrgicas</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Salas D e K (Orto)</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Formalizar pedidos 1 dia antes</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-200 transition-colors">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Claudirene</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Liberações Cirúrgicas</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Confirmar status das cirurgias</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-200 transition-colors">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Jéssica</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Apartamentos (Particular)</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Cobrar vaga se convênio particular</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-200 transition-colors">
                    <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1">Terça-Feira</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Guias Residentes</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Lucas, Marcelo, Juan, Barbara (÷4)</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-200 transition-colors">
                    <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-1">Sistema Externo</p>
                    <a 
                      href="http://137.131.212.177:3001/api" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Acessar Sistema API <ExternalLink className="w-3 h-3" />
                    </a>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Link para API externa</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-200 transition-colors">
                    <p className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider mb-1">Centro de Custo</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white tracking-widest">527</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Ortopedia (Geral)</p>
                  </div>
                </div>
              </div>

              {/* Tabela de Valores */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 text-sm md:text-base">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" /> Tabela de Valores (Consultas)
                  </h3>
                </div>
                <div className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex justify-between items-center p-3.5 md:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base">Avaliação Pré-Anestésica</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 px-2.5 py-1 rounded-lg text-sm md:text-base font-mono">R$ 250,00</span>
                  </div>
                  <div className="flex justify-between items-center p-3.5 md:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base">Consulta Online</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 px-2.5 py-1 rounded-lg text-sm md:text-base font-mono">R$ 200,00</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* --- MAPA CIRÚRGICO VIEW --- */}
          {activeTab === 'mapa' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto space-y-4 md:space-y-6"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Organização do Centro Cirúrgico (Joelho, Quadril, Pediátrica)</p>
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium">
                    <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Adicionar</span>
                  </button>
                  <button className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium">
                    <Printer className="w-4 h-4" /> Printar <span className="hidden sm:inline">Mapa (R4)</span>
                  </button>
                </div>
              </div>

              {/* Checklist de Mapas Ajustados */}
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 overflow-hidden">
                <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 text-sm md:text-base">
                      <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Checklist de Mapas Ajustados (Diário)
                    </h3>
                    {lastMapAdjustment && (
                      <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-7">
                        Último ajuste: {lastMapAdjustment.toLocaleDateString('pt-BR')} às {lastMapAdjustment.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button 
                      onClick={() => {
                        if (confirm('Deseja resetar o checklist para hoje?')) {
                          setMapChecklist(MAPAS_ESPECIALIDADES.map(s => ({ ...s, done: false })));
                          setLastMapAdjustment(null);
                        }
                      }}
                      className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                    >
                      Resetar
                    </button>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800/50">
                      {mapChecklist.filter(m => m.done).length} / {mapChecklist.length}
                    </span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {mapChecklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleMapCheck(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        item.done 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.done 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {item.done && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-sm font-bold">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Card View for Surgeries */}
              <div className="md:hidden space-y-3">
                {MOCK_SURGERIES.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-10 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                      <ClipboardList className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-base font-semibold">Nenhum paciente agendado</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">O mapa cirúrgico está vazio no momento.</p>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                      <Plus className="w-4 h-4" /> Adicionar Paciente
                    </button>
                  </div>
                ) : (
                  MOCK_SURGERIES.map((surg) => (
                    <div key={surg.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2 mb-1">
                            <span className="text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md text-sm border border-blue-100 dark:border-blue-800/50">{surg.time}</span>
                            {surg.patient}
                            {surg.alergico && <span title="Paciente Alérgico" className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Alérgico</span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 flex-wrap">
                            <span className="bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">{surg.age} anos</span>
                            <span>•</span>
                            <span className="text-slate-600 dark:text-slate-300">{surg.status}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-100/50 dark:border-blue-800/50"><Bed className="w-3 h-3" /> {surg.room || 'A definir'}</span>
                          </div>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider shadow-sm text-right max-w-[120px] leading-tight">
                          {formatSurgeryType(surg.type)}
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          <div className="p-1.5 bg-white dark:bg-slate-900 rounded-md shadow-sm">
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          {surg.doctor}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${surg.opme ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                            <span className="text-[10px] font-bold tracking-wider mb-1">OPME</span>
                            {surg.opme ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-600" />}
                          </div>
                          <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${surg.blood ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                            <span className="text-[10px] font-bold tracking-wider mb-1">SANGUE</span>
                            {surg.blood ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-600" />}
                          </div>
                          <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${surg.icu ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-400 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                            <span className="text-[10px] font-bold tracking-wider mb-1">UTI</span>
                            {surg.icu ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-600" />}
                          </div>
                        </div>

                        {getAutomaticNotes(surg) && (
                          <div className="flex items-start gap-2.5 bg-amber-50/80 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300 p-3 rounded-xl border border-amber-200/60 dark:border-amber-800/50 text-xs leading-relaxed shadow-sm">
                            <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <span className="font-medium">{getAutomaticNotes(surg)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View for Surgeries */}
              <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                        <th className="p-4 font-medium w-24">Horário</th>
                        <th className="p-4">Paciente / Idade</th>
                        <th className="p-4 font-medium">Tipo / Médico</th>
                        <th className="p-4 font-medium text-center">OPME</th>
                        <th className="p-4 font-medium text-center">Sangue</th>
                        <th className="p-4 font-medium text-center">UTI</th>
                        <th className="p-4 font-medium">Observações (NÃO APAGAR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {MOCK_SURGERIES.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-16 text-center text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/30">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-slate-800">
                                <ClipboardList className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                              </div>
                              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Nenhum paciente agendado</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">O mapa cirúrgico está vazio no momento. Adicione novos pacientes para começar.</p>
                              <button className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-medium">
                                <Plus className="w-4 h-4" /> Adicionar Paciente
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        MOCK_SURGERIES.map((surg) => (
                          <tr key={surg.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="p-4 font-mono text-blue-600 dark:text-blue-400 font-bold text-sm">
                              {surg.time}
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-slate-800 dark:text-white flex items-center gap-1.5">
                                {surg.patient}
                                {surg.alergico && <span title="Paciente Alérgico" className="text-base leading-none" aria-label="Alerta de Alergia">⚠️</span>}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                <span>{surg.age} anos</span>
                                <span>•</span>
                                <span>{surg.status}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-blue-700 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-100/50 dark:border-blue-800/50"><Bed className="w-3 h-3" /> {surg.room || 'A definir'}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium mb-1">
                                {formatSurgeryType(surg.type)}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">{surg.doctor}</div>
                            </td>
                            <td className="p-4 text-center">
                              {surg.opme ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-600">-</span>}
                            </td>
                            <td className="p-4 text-center">
                              {surg.blood ? <CheckCircle2 className="w-5 h-5 text-red-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-600">-</span>}
                            </td>
                            <td className="p-4 text-center">
                              {surg.icu ? <CheckCircle2 className="w-5 h-5 text-purple-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-600">-</span>}
                            </td>
                            <td className="p-4">
                              {getAutomaticNotes(surg) ? (
                                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 p-2 rounded border border-amber-100 dark:border-amber-800/50 text-sm">
                                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                  <span>{getAutomaticNotes(surg)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
                  <span>Mostrando {MOCK_SURGERIES.length} cirurgias agendadas.</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-orange-500 dark:text-orange-400"/> Lembrete: 12:40 enviar para OPME e Regulação.</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- ROTINAS VIEW --- */}
          {activeTab === 'rotinas' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto space-y-6 md:space-y-8"
            >
              <div className="mb-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Rotinas Diárias</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Acompanhe o checklist do plantão e a rotina fixa da semana.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white">Checklist do Plantão</h3>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Marque as tarefas conforme forem concluídas.</p>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={exportTasks}
                        className="text-[10px] md:text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors flex items-center gap-1"
                        title="Exportar como JSON"
                      >
                        <Download className="w-3 h-3" /> Exportar
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] md:text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition-colors flex items-center gap-1"
                        title="Importar de JSON"
                      >
                        <Upload className="w-3 h-3" /> Importar
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={importTasks} 
                        accept=".json" 
                        className="hidden" 
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (window.confirm('Deseja resetar todas as tarefas para o padrão original?')) {
                          setDailyTasks(DAILY_TASKS);
                        }
                      }}
                      className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Resetar padrão
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-full md:w-32 bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                        <div className="bg-emerald-500 dark:bg-emerald-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(dailyTasks.filter(t => t.done).length / dailyTasks.length) * 100}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {dailyTasks.filter(t => t.done).length} de {dailyTasks.length}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Add task form in Rotinas tab */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const task = formData.get('task') as string;
                      const time = formData.get('time') as string;
                      if (task.trim()) {
                        addTask(task, time || "Rotina");
                        e.currentTarget.reset();
                      }
                    }}
                    className="flex flex-col md:flex-row gap-2"
                  >
                    <input 
                      name="time"
                      type="text" 
                      placeholder="Horário (ex: 09:00)"
                      className="w-full md:w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                    />
                    <input 
                      name="task"
                      type="text" 
                      placeholder="Nova tarefa de rotina..."
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                    />
                    <button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Adicionar
                    </button>
                  </form>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[...dailyTasks]
                    .sort((a, b) => getTimePriority(a.time) - getTimePriority(b.time))
                    .map(task => (
                    <div 
                      key={task.id} 
                      className={`flex items-start md:items-center gap-3 md:gap-4 p-4 md:p-5 transition-colors group ${
                        task.highlight && !task.done 
                          ? "bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-500" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {editingTaskId === task.id ? (
                        <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
                          <input 
                            type="text"
                            value={editingTaskValue.time}
                            onChange={(e) => setEditingTaskValue(prev => ({ ...prev, time: e.target.value }))}
                            className="w-full md:w-24 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none dark:text-white"
                          />
                          <input 
                            type="text"
                            value={editingTaskValue.task}
                            onChange={(e) => setEditingTaskValue(prev => ({ ...prev, task: e.target.value }))}
                            className="flex-1 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none dark:text-white"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={saveEdit}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              Salvar
                            </button>
                            <button 
                              onClick={cancelEdit}
                              className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => toggleTask(task.id)}
                            className="focus:outline-none mt-0.5 md:mt-0 relative"
                          >
                            {task.done ? (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 dark:text-emerald-400" />
                              </motion.div>
                            ) : (
                              <Circle className={`w-5 h-5 md:w-6 md:h-6 transition-colors ${task.highlight ? "text-amber-400 dark:text-amber-600" : "text-slate-300 dark:text-slate-600 group-hover:text-blue-400 dark:group-hover:text-blue-500"}`} />
                            )}
                          </button>
                          <div 
                            onClick={() => toggleTask(task.id)}
                            className={`flex-1 transition-all duration-300 cursor-pointer ${task.done ? "opacity-50" : ""}`}
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold ${task.highlight && !task.done ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>{task.time}</span>
                              {task.alert && !task.done && <span className={`px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold flex items-center gap-1 ${task.highlight ? "bg-amber-500 text-white" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}><Clock className="w-3 h-3"/> {task.highlight ? "FECHAMENTO CRÍTICO" : "Importante"}</span>}
                            </div>
                            <p className={`text-sm md:text-base font-bold transition-all duration-300 ${task.done ? "text-slate-500 dark:text-slate-400 line-through" : task.highlight ? "text-amber-900 dark:text-amber-200" : "text-slate-800 dark:text-slate-200"}`}>{task.task}</p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(task);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-blue-500 transition-all"
                              title="Editar tarefa"
                            >
                              <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"
                              title="Excluir tarefa"
                            >
                              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ROTINA SEMANAL */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white mb-4">Rotina Fixa da Semana</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {WEEKLY_ROUTINE.map((dayRoutine, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-900/20 text-center">
                        <h4 className="font-bold text-sm text-blue-800 dark:text-blue-400">{dayRoutine.day}</h4>
                      </div>
                      <div className="p-4 flex-1">
                        <ul className="space-y-3">
                          {dayRoutine.tasks.map((task, taskIdx) => (
                            <li key={taskIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* --- PROTOCOLOS VIEW --- */}
          {activeTab === 'protocolos' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto space-y-8 pb-24"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Protocolos (POP)</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Base de conhecimento e Procedimentos Operacionais Padrão do setor.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setPopCollapseSignal(prev => prev + 1)}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:text-blue-600 transition-all shadow-sm"
                  >
                    <ChevronUp className="w-4 h-4" /> Recolher Tudo
                  </button>
                  <div className="relative w-full md:w-80 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar por título ou descrição..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl leading-5 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Navigation Categories */}
              <div className="flex flex-wrap items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setPopCollapseSignal(prev => prev + 1)}
                  className="md:hidden px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2"
                >
                  <ChevronUp className="w-3 h-3" /> Recolher Tudo
                </button>
                {PROTOCOLS.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const element = document.getElementById(`pop-section-${idx}`);
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm whitespace-nowrap flex items-center gap-2"
                  >
                    {React.cloneElement(section.icon as React.ReactElement, { className: 'w-3 h-3' })}
                    {section.category}
                  </button>
                ))}
              </div>
              
              {filteredProtocols.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhum resultado encontrado</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Não encontramos protocolos para "{searchQuery}"</p>
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                  >
                    Limpar busca
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                  {filteredProtocols.map((section, idx) => (
                    <div key={idx} id={`pop-section-${idx}`} className="scroll-mt-24">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                          {React.cloneElement(section.icon as React.ReactElement, { className: 'w-6 h-6' })}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{section.category}</h3>
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{section.items.length} Procedimentos</p>
                        </div>
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 ml-2"></div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {section.items.map((item, i) => (
                          <CollapsibleProtocolItem key={i} item={item} collapseSignal={popCollapseSignal} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'roteiro' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto space-y-6 pb-24"
            >
              <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  Roteiro Didático
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Passo a passo do seu dia no setor de Ortopedia.</p>
              </header>

              <div className="space-y-6">
                {ROTEIRO_STEPS.map((step, index) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-5 md:p-6 rounded-3xl border ${step.color} dark:bg-slate-900 dark:border-slate-800 shadow-sm relative overflow-hidden`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm shrink-0">
                        {step.icon}
                      </div>
                      <h3 className={`text-lg md:text-xl font-bold ${step.textColor} dark:text-white`}>{step.title}</h3>
                    </div>
                    <ul className="space-y-3 ml-2 md:ml-4">
                      {step.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className={`mt-2 w-1.5 h-1.5 rounded-full ${step.textColor} dark:bg-blue-400 opacity-50 shrink-0`} />
                          <span className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- PRECEPTORES VIEW --- */}
          {activeTab === 'preceptores' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto space-y-6 pb-24"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Preceptores da Ortopedia</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visita Comercial - Horários e Especialidades</p>
              </div>

              <div className="md:hidden space-y-4">
                {PRECEPTORES.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-200 dark:border-blue-800">
                        {item.doctor.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight">{item.doctor}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                          {item.specialty}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="p-1.5 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Visita Comercial</span>
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                        <th className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 text-sm whitespace-nowrap">Preceptor(es)</th>
                        <th className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 text-sm whitespace-nowrap">Especialidade</th>
                        <th className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 text-sm whitespace-nowrap">Horário (Visita Comercial)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {PRECEPTORES.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-100 dark:border-blue-800 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 transition-colors">
                                {item.doctor.charAt(0)}
                              </div>
                              <div className="font-medium text-slate-800 dark:text-white text-base">{item.doctor}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 whitespace-nowrap shadow-sm">
                              {item.specialty}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 w-fit">
                              <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                              {item.time}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- DICAS E MACETES VIEW --- */}
          {activeTab === 'dicas' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto space-y-6 pb-24"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dicas e Macetes</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Atalhos, macetes de sistema e informações úteis do dia a dia organizados por categoria.</p>
              </div>

              <div className="space-y-8">
                {DICAS_CATEGORIZADAS.map((categoria, catIdx) => (
                  <div key={catIdx} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        {categoria.icon}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{categoria.category}</h3>
                    </div>
                    <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {categoria.items.map((dica, idx) => (
                        <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow hover:bg-white dark:hover:bg-slate-800/80">
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm shrink-0">
                              {dica.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-white mb-1.5 text-sm md:text-base">{dica.title}</h4>
                              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{dica.desc}</p>
                              {dica.link && (
                                <a 
                                  href={dica.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                  Acessar Link <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- TERMOS TÉCNICOS VIEW --- */}
          {activeTab === 'termos' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 md:p-8 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
                        <Book className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight">Termos Técnicos</h3>
                        <p className="text-blue-100 text-sm md:text-base font-medium opacity-90">Glossário essencial de ortopedia e traumatologia</p>
                      </div>
                    </div>
                    
                    <div className="relative max-w-2xl">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
                      <input 
                        type="text"
                        placeholder="Pesquisar termo ou definição..."
                        value={techTermsSearchQuery}
                        onChange={(e) => setTechTermsSearchQuery(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all shadow-inner text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {TECHNICAL_TERMS.filter(item => 
                      item.term.toLowerCase().includes(techTermsSearchQuery.toLowerCase()) || 
                      item.definition.toLowerCase().includes(techTermsSearchQuery.toLowerCase())
                    ).map((item, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg transition-all hover:bg-white dark:hover:bg-slate-800 group"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.term}
                            </h4>
                            <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                              <Info className="w-4 h-4 text-blue-500" />
                            </div>
                          </div>
                          <div className="h-px w-full bg-slate-200 dark:bg-slate-800/50"></div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {item.definition}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {TECHNICAL_TERMS.filter(item => 
                    item.term.toLowerCase().includes(techTermsSearchQuery.toLowerCase()) || 
                    item.definition.toLowerCase().includes(techTermsSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-full">
                          <Search className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-slate-800 dark:text-white">Nenhum termo encontrado</p>
                          <p className="text-slate-500 dark:text-slate-400">Tente pesquisar com outras palavras-chave.</p>
                        </div>
                        <button 
                          onClick={() => setTechTermsSearchQuery('')}
                          className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                          Limpar Pesquisa
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sigtap' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto space-y-6 pb-24"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">SIGTAP SUS</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Busca rápida de códigos de procedimentos ortopédicos.</p>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar por código ou descrição (ex: 0408010018 ou Quadril)..."
                  className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                  value={sigtapSearchQuery}
                  onChange={(e) => setSigtapSearchQuery(e.target.value)}
                />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <th className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 text-sm whitespace-nowrap w-40">Código</th>
                        <th className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 text-sm">Descrição do Procedimento</th>
                        <th className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300 text-sm text-center w-24">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {SIGTAP_CODES.filter(item => 
                        item.code.includes(sigtapSearchQuery) || 
                        item.desc.toLowerCase().includes(sigtapSearchQuery.toLowerCase())
                      ).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                          <td className="py-4 px-6">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md text-sm">
                              {item.code}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm font-medium text-slate-800 dark:text-white leading-relaxed">
                              {item.desc}
                            </div>
                            {item.definition && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic font-normal">
                                {item.definition}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(item.code);
                                // Optional: add a toast or feedback
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
                              title="Copiar Código"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {SIGTAP_CODES.filter(item => 
                        item.code.includes(sigtapSearchQuery) || 
                        item.desc.toLowerCase().includes(sigtapSearchQuery.toLowerCase())
                      ).length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                              <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum código encontrado para "{sigtapSearchQuery}"</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- RAMAIS VIEW --- */}
          {activeTab === 'ramais' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto space-y-8 pb-24"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ramais Úteis</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lista completa de ramais internos do hospital.</p>
              </div>

              {RAMAIS_DATA.map((category, catIdx) => (
                <div key={catIdx} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{category.category}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((item, itemIdx) => (
                      <div 
                        key={itemIdx} 
                        className={`p-4 rounded-2xl border transition-all ${
                          item.highlight 
                            ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 shadow-sm' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className={`text-sm font-bold mb-2 ${item.highlight ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                              {item.name}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {item.numbers.map((num, nIdx) => (
                                <span 
                                  key={nIdx}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-mono font-bold ${
                                    item.highlight
                                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <Phone className="w-3 h-3" />
                                  {num}
                                </span>
                              ))}
                            </div>
                          </div>
                          {item.highlight && (
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-lg">
                              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 pb-safe transition-colors duration-300">
        <ul className="flex justify-around items-center h-16 px-1 overflow-x-auto no-scrollbar">
          <li className="flex-shrink-0">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 ${activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[9px] font-medium">Início</span>
            </button>
          </li>
          <li className="flex-shrink-0">
            <button 
              onClick={() => setActiveTab('mapa')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 ${activeTab === 'mapa' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[9px] font-medium">Mapa</span>
            </button>
          </li>
          <li className="flex-shrink-0">
            <button 
              onClick={() => setActiveTab('rotinas')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 ${activeTab === 'rotinas' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <CheckSquare className="w-5 h-5" />
              <span className="text-[9px] font-medium">Rotinas</span>
            </button>
          </li>
          <li className="flex-shrink-0">
            <button 
              onClick={() => setActiveTab('protocolos')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 ${activeTab === 'protocolos' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[9px] font-medium">POP</span>
            </button>
          </li>
          <li className="flex-shrink-0">
            <button 
              onClick={() => setActiveTab('termos')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 ${activeTab === 'termos' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Book className="w-5 h-5" />
              <span className="text-[9px] font-medium">Termos</span>
            </button>
          </li>
          <li className="flex-shrink-0">
            <button 
              onClick={() => setActiveTab('roteiro')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 ${activeTab === 'roteiro' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Map className="w-5 h-5" />
              <span className="text-[9px] font-medium">Roteiro</span>
            </button>
          </li>
          <li className="flex-shrink-0">
            <button 
              onClick={() => setActiveTab('preceptores')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 ${activeTab === 'preceptores' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[9px] font-medium">Precept.</span>
            </button>
          </li>
          <li className="flex-shrink-0">
            <button 
              onClick={() => setActiveTab('dicas')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 ${activeTab === 'dicas' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Lightbulb className="w-5 h-5" />
              <span className="text-[9px] font-medium">Dicas</span>
            </button>
          </li>
          <li className="flex-shrink-0">
            <button 
              onClick={() => setActiveTab('sigtap')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 ${activeTab === 'sigtap' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Search className="w-5 h-5" />
              <span className="text-[9px] font-medium">SIGTAP</span>
            </button>
          </li>
          <li className="flex-shrink-0">
            <button 
              onClick={() => setActiveTab('ramais')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 ${activeTab === 'ramais' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Phone className="w-5 h-5" />
              <span className="text-[9px] font-medium">Ramais</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
