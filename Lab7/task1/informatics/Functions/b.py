def power(a, n):
    result = 1
    for i in range(n):
        result *= a
    return result


a = float(input())
n = int(input())

print(power(a, n))