function convertFormat(f1, f2, data)
{
    if (f1 == f2)
    {
        return data;
    }

    if (f2-f1 == 1) {
        switch (f1)
        {
            case 1:
                data = [2, [0,0], data[1], data[2], data[3], data[4]];
                return data;
        }
    }
}