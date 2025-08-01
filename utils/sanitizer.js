export function sanitize(text){
    return text.replace(/[^\w\s]/gi, '')
}