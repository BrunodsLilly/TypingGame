// ============================================
// Internationalization — EN / PT translations
// ============================================

/**
 * Current language: 'en' or 'pt'.
 * Toggled via the lang button or L key on home screen.
 * @type {'en'|'pt'}
 */
let lang = 'en';

/**
 * Translation strings for all UI text.
 * @type {Object<string, Object<string, string|string[]>>}
 */
const I18N = {
    en: {
        find: 'Find',
        findThe: 'Find the',
        whoSays: 'Who says',
        howMany: 'How many',
        countThem: 'Count them! Press the number!',
        countSpeak: 'How many? Count them! Press the number!',
        pressLetter: 'Press the letter',
        pressOn: 'Press %s on the keyboard!',
        letterFor: '%s for %s',
        spellWord: 'Spell the word!',
        pickWord: 'Pick a word to spell!',
        pickWordHint: 'Space for random, or press 1-8 to pick!',
        orPick: 'or pick:',
        spell: 'Spell',
        press: 'Press',
        whatNext: 'What comes next?',
        whatNextPattern: 'What comes next in the pattern?',
        whatRhymes: 'What rhymes with',
        whatElement: 'What element is this?',
        whatSymbol: 'What element has the symbol',
        remember: 'Remember the cards!',
        lookRemember: 'Look! Remember where each one is!',
        rememberHint: 'Remember where each emoji is!',
        findPairs: 'Find the matching pairs!',
        flipCard: 'Press 1-8 to flip a card!',
        flipAnother: 'Now flip another card!',
        notMatch: 'Not a match! Try again!',
        tryAgainFlip: 'Try again! Press 1-8!',
        pairsLeft: '%d pair%s left',
        back: 'Back',
        pressKey: 'Press a key to play!',
        allStars: 'You got all the stars! Amazing job!',
        allStarsText: '\u2B50 ALL STARS! \u2B50',
        encouragements: ['Yay!', 'Great job!', 'Awesome!', 'You did it!', 'Super!', 'Amazing!', 'Wonderful!'],
        tryAgain: ['Oops! Try again!', 'Not quite! Try again!', 'Almost! Try again!'],
        match: ['Yay!', 'Great job!', 'A match!', 'You found it!', 'Super!', 'Amazing!'],
        plus: 'plus',
        equalsWhat: 'equals what? Press the number!',
        mathHint: '%d + %d = ? Press the number!',
        homeTips: [
            'Press a key to play!',
            '11 games to explore!',
            'Learn colors, shapes & more!',
            'Spell words letter by letter!',
            'Find patterns & rhymes!',
            'Train your memory!',
            'Discover the elements!',
        ],
        gameNames: {
            colors: 'Colors', shapes: 'Shapes', count: 'Count', letters: 'ABCs',
            animals: 'Animals', math: 'Math', words: 'Words', patterns: 'Patterns',
            rhymes: 'Rhymes', memory: 'Memory', elements: 'Elements',
        },
    },
    pt: {
        find: 'Encontre',
        findThe: 'Encontre o',
        whoSays: 'Quem faz',
        howMany: 'Quantos',
        countThem: 'Conte! Aperte o n\u00FAmero!',
        countSpeak: 'Quantos? Conte! Aperte o n\u00FAmero!',
        pressLetter: 'Aperte a letra',
        pressOn: 'Aperte %s no teclado!',
        letterFor: '%s de %s',
        spellWord: 'Soletre a palavra!',
        pickWord: 'Escolha uma palavra!',
        pickWordHint: 'Espa\u00E7o para aleat\u00F3rio, ou aperte 1-8!',
        orPick: 'ou escolha:',
        spell: 'Soletre',
        press: 'Aperte',
        whatNext: 'O que vem depois?',
        whatNextPattern: 'O que vem depois no padr\u00E3o?',
        whatRhymes: 'O que rima com',
        whatElement: 'Que elemento \u00E9 este?',
        whatSymbol: 'Que elemento tem o s\u00EDmbolo',
        remember: 'Lembre dos cart\u00F5es!',
        lookRemember: 'Olhe! Lembre onde cada um est\u00E1!',
        rememberHint: 'Lembre onde cada emoji est\u00E1!',
        findPairs: 'Encontre os pares!',
        flipCard: 'Aperte 1-8 para virar!',
        flipAnother: 'Agora vire outro cart\u00E3o!',
        notMatch: 'N\u00E3o combina! Tente de novo!',
        tryAgainFlip: 'Tente de novo! Aperte 1-8!',
        pairsLeft: '%d par%s restante%s',
        back: 'Voltar',
        pressKey: 'Aperte uma tecla para jogar!',
        allStars: 'Voc\u00EA conseguiu todas as estrelas! Incr\u00EDvel!',
        allStarsText: '\u2B50 TODAS AS ESTRELAS! \u2B50',
        encouragements: ['Oba!', 'Muito bem!', 'Incr\u00EDvel!', 'Conseguiu!', 'Super!', 'Demais!', 'Maravilha!'],
        tryAgain: ['Opa! Tente de novo!', 'Quase! Tente de novo!', 'Quase l\u00E1! Tente de novo!'],
        match: ['Oba!', 'Muito bem!', 'Combinou!', 'Encontrou!', 'Super!', 'Demais!'],
        plus: 'mais',
        equalsWhat: '\u00E9 quanto? Aperte o n\u00FAmero!',
        mathHint: '%d + %d = ? Aperte o n\u00FAmero!',
        homeTips: [
            'Aperte uma tecla para jogar!',
            '11 jogos para explorar!',
            'Aprenda cores, formas e mais!',
            'Soletre palavras letra por letra!',
            'Encontre padr\u00F5es e rimas!',
            'Treine sua mem\u00F3ria!',
            'Descubra os elementos!',
        ],
        gameNames: {
            colors: 'Cores', shapes: 'Formas', count: 'Contar', letters: 'ABC',
            animals: 'Animais', math: 'Matem\u00E1tica', words: 'Palavras', patterns: 'Padr\u00F5es',
            rhymes: 'Rimas', memory: 'Mem\u00F3ria', elements: 'Elementos',
        },
    }
};

/**
 * Returns the translated string for the given key in the current language.
 * @param {string} key - Translation key
 * @returns {string|string[]} Translated value
 */
function t(key) {
    return I18N[lang][key];
}
