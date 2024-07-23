function normalIf(num){
    if(num >= 6 && num <= 10) return "first"
    else if(num < 2 || num > 3) return "second"
    else{
        return "third"
    }
}

function switchIf(num){
    switch(num){
        case num < 6: console.log("hm")
    }
}

console.log(normalIf(2), normalIf(8), normalIf(15))
switchIf(6)

