export function isGrounded(body:{blocked:{down:boolean};touching:{down:boolean}}){return body.blocked.down||body.touching.down;}
