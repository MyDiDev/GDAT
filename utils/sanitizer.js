export function sanitize(text){
    return String(text).replace(/[^\w\s]/gi, '')
}