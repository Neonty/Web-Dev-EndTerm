def xor(x, y):
    return (x and not y) or (y and not x)


x = int(input())
y = int(input())

print(int(xor(x, y)))