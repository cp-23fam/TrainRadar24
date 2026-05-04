
function to_duration(text, type) {
    var duration = '';

    [days, time] = text.split('d');
    [hours, minutes, secondes] = time.split(':');

    switch (type) {
        case 'd':
            duration =  `${days + (hours + (minutes + (secondes) / 60) / 60 ) / 24} days`;
        case 'h':
            duration = `${days * 24 + hours + (minutes + (secondes) / 60) / 60 } hours` 
        case 'm':
            duration = `${((days) * 24 + hours) * 60 + minutes + secondes / 60 } minutes` 
        case 's':
            duration = `${(((days) * 24 + hours) * 60 + minutes) * 60 + secondes } seconds` 
        }

    return duration;
}

module.exports = ({
    to_duration,
});