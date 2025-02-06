function convertFormat(f1, f2, data)
{
    if (f1 == f2)
    {
        return data;
    }

    if (f1 > f2)
    {
        throw new Error('Someone tried to degrade a save to an old format. That\'s no good')
        return "WTF ARE YOU DOING?";
    }

    if (f2-f1 == 1) {
        switch (f1)
        {
            case 1:
                data = [2, [0,0], data[1], data[2], data[3], data[4]];
                return data;
            case 2:
                data = [2, [0,0], data[1], data[2], data[3], data[4], []];
                return data;
        }
    }
    else { // if difference is more than 1
        return convertFormat(f2-1, f2, convertFormat(f1,f2-1, data));
    }
}