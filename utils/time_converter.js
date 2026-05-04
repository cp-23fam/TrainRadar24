
function to_duration(text, type) {
    var duration = '';

    [days, time] = text.split('d');
    [hours, minutes, secondes] = time.split(':');

    switch (type) {
        case 'd':
            duration = `${days + (hours + (minutes + (secondes) / 60) / 60) / 24} days`;
            break;
        case 'h':
            duration = `${days * 24 + hours + (minutes + (secondes) / 60) / 60} hours`;
            break;
        case 'm':
            duration = `${((days) * 24 + hours) * 60 + minutes + secondes / 60} minutes`;
            break;
        case 's':
            duration = `${(((days) * 24 + hours) * 60 + minutes) * 60 + secondes} seconds`;
            break;
    }

    return duration;
}

function to_date(text) {
    return Date(text);
}

module.exports = ({
    to_duration,
});