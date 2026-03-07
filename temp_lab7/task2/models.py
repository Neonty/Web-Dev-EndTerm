class Animal:
    def __init__(self, name, age, species):
        self.name = name
        self.age = age
        self.species = species

    def speak(self):
        return "Some animal sound"

    def info(self):
        return f"{self.name} is {self.age} years old."

    def __str__(self):
        return f"Animal: {self.name}, Age: {self.age}, Species: {self.species}"


class Dog(Animal):
    def __init__(self, name, age, breed):
        super().__init__(name, age, "Dog")
        self.breed = breed

    def speak(self):  # override method
        return "Woof!"

    def fetch(self):
        return f"{self.name} is fetching a ball."


class Cat(Animal):
    def __init__(self, name, age, color):
        super().__init__(name, age, "Cat")
        self.color = color

    def speak(self):  # override method
        return "Meow!"

    def sleep(self):
        return f"{self.name} is sleeping."