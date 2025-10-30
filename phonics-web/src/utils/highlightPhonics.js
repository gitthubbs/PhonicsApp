export function highlightPhonics(sentence, phoneme) {
    // 音标与常见拼写的映射，可根据需要补充或调整
    const mapping = {
        'iː': /(ee|ea|ie|i)/gi,
        'ɪ': /(i|y)/gi,
        'e': /(e|ea)/gi,
        'æ': /a/gi,
        'ɑː': /(ar|a)/gi,
        'ɒ': /o/gi,
        'ɔː': /(aw|au|or|oar|our|all)/gi,
        'ʊ': /(oo|u)/gi,
        'uː': /(oo|u|ew|ue)/gi,
        'ʌ': /(u|o)/gi,
        'ɜː': /(ir|ur|er|ear|or)/gi,
        'ə': /(a|e|i|o|u)/gi,
        // 其他辅音直接匹配单字母
        'p': /p/gi, 'b': /b/gi, 't': /t/gi, 'd': /d/gi, 'k': /k/gi, 'g': /g/gi,
        'f': /f/gi, 'v': /v/gi, 'θ': /th/gi, 'ð': /th/gi,
        's': /s/gi, 'z': /z/gi, 'ʃ': /sh/gi, 'ʒ': /ge|sion|zure/gi,
        'h': /h/gi, 'm': /m/gi, 'n': /n/gi, 'ŋ': /ng/gi,
        'l': /l/gi, 'r': /r/gi, 'j': /y/gi, 'w': /w/gi,
        'eɪ': /(a|ai|ay)/gi, 'aɪ': /(i|igh|y)/gi, 'ɔɪ': /(oi|oy)/gi,
        'aʊ': /(ou|ow)/gi, 'əʊ': /(o|oa|ow)/gi, 'ɪə': /(ear|eer|ere)/gi,
        'eə': /(air|are|ear)/gi, 'ʊə': /(ure|our)/gi,
    };

    const regex = mapping[phoneme];
    if (!regex) return sentence;

    return sentence.replace(regex, match => `<span style="color:green;font-weight:bold">${match}</span>`);
}
