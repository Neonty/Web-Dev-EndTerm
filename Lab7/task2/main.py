from models import Animal, Dog, Cat


def main():
    dog = Dog("Buddy", 3, "Labrador")
    cat = Cat("Misty", 2, "White")
    animal = Animal("Generic", 5, "Unknown")

    animals = [dog, cat, animal]

    for a in animals:
        print(a)
        print(a.info())
        print("Sound:", a.speak())
        print()

    print(dog.fetch())
    print(cat.sleep())


if __name__ == "__main__":
    main()