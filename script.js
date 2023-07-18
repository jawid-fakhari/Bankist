'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//Creating DOM Elements
//template string, template literal
// .insertAdjacentHTML(position, text)
const calcDisplayMovements = function (movements) {
  containerMovements.innerHTML = '';

  movements.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1} ${type} </div>
          <div class="movements__value">${mov}</div>
        </div>
        `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// sorting movements
let sorted = false;
btnSort.addEventListener('click', function (e) {

  const newSortArr = currentUser.movements.slice().sort((a, b) => a - b);
  const notSort = currentUser.movements;

  sorted ? calcDisplayMovements(newSortArr) : calcDisplayMovements(notSort);
  sorted = !sorted;
});


//computing display balance
const calcBalance = function (acc) {
  acc.balance = acc.movements.reduce((accumalatore, mov) => accumalatore + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};


//computing display Income, Outcome & interest 
const calcDisplaySummary = function (movements) {
  const calcIncome = movements
    .filter(mov => mov > 0)
    .reduce((accomulatore, mov) => accomulatore + mov, 0);
  labelSumIn.textContent = `${calcIncome}€`;

  const calcOutcome = movements
    .filter(mov => mov < 0)
    .reduce((accomulatore, mov) => accomulatore + mov, 0);
  labelSumOut.textContent = `${Math.abs(calcOutcome)}€`;

  //ipotizando con ogni deposito si da un interesse, e anche solo se piu di 1€
  const interest = movements
    .filter(mov => mov > 0)
    .map((deposit) => (deposit * currentUser.interestRate) / 100)
    .filter((int, i, arr) => int >= 1) // se l'interesse è più di 1€
    .reduce((accomulatore, int) => accomulatore + int, 0);
  labelSumInterest.textContent = `${Math.trunc(interest)}€`;
};

//Computing username
const createUserName = function (accs) {
  accs.forEach(function (acc, i, arr) {
    acc.username = acc.owner
      .toLocaleLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserName(accounts);

// displaye current date
const displayDate = function(){
  const createDate = new Date();
  const today = Intl.DateTimeFormat('it-IT').format(createDate);
  labelDate.textContent = today;
}

//logout countdown timer
const setLogout = function(){
  let time = 5*60;
  const tick = function (){
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const sec = String(Math.floor(time % 60)).padStart(2, 0)
    labelTimer.textContent = `${min}:${sec}`;
    if(time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  }
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}

//refresh countdown function
const refreshTimer = function(){
  //if countdown true so clear interval
  if(timer) clearInterval(timer);
  timer = setLogout();
}
// event handler, login btn - username, pin, displays
let currentUser, timer;
// UI diplay
const updateUI = function () {
  calcDisplayMovements(currentUser.movements);
  calcDisplaySummary(currentUser.movements);
  calcBalance(currentUser);
  displayDate();
};

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  //Find the current user
  currentUser = accounts.find(
    acc => acc.username === inputLoginUsername.value);
  
  //currect credential?
  if (currentUser?.pin === Number(inputLoginPin.value)) {
    // yes, display UI & welcom massage
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome Back, ${currentUser.owner.split(' ')[0]}`
    // clear input fields and movement container

    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();
    //refresh timer
    refreshTimer();
    updateUI(currentUser);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const reciverAcc = accounts.find(
    acc => acc?.username === inputTransferTo.value
  );
  if (
    amount > 0 &&
    reciverAcc &&
    currentUser.balance >= amount &&
    reciverAcc?.username !== currentUser.username
  ) {

    currentUser.movements.push(-amount);
    reciverAcc.movements.push(amount);
    updateUI(currentUser);
    inputTransferTo.value = inputTransferAmount.value = '';
  }
  //refresh timer
  refreshTimer();
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = Number(inputLoanAmount.value);
  //refresh timer
  refreshTimer();
  if (loanAmount > 0 && currentUser.movements
    .some(mov => mov >= loanAmount * 0.1)) {

    currentUser.movements.push(loanAmount);
    updateUI(currentUser);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const closeUser = inputCloseUsername.value;
  const closePin = Number(inputClosePin.value);
  if (closeUser === currentUser.username && closePin === currentUser.pin) {
    const index = accounts.findIndex(acc => closeUser === acc.username)
    accounts.splice(index, 1);
    inputClosePin.value = inputCloseUsername.value = '';
    containerApp.style.opacity = 0;
  };
});


/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES


/////////////////////////////////////////////////
/*
// forEach, array usecase
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const arr = [3, 2, 1, 6];
//for-of VS forEach
console.log('**********for of loop*******');
for (const [i, mov] of movements.entries()) {
  if(mov > 0){
    console.log(`Movment ${i + 1}: You deposit ${mov}`);
  }else {
    console.log(`Movment ${i + 1}: You withdrow ${Math.abs(mov)}`);
  }
}
console.log('**********forEach loop**********');
movements.forEach(function(mov, i, arr){
  if(mov > 0){
    console.log(`Movment ${i + 1}: You deposit ${mov}`);
  }else {
    console.log(`Movment ${i + 1}: You withdrow ${Math.abs(mov)}`);
  }
});

// forEach, Map usecase
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]); 
currencies.forEach(function(value, key, map){
  console.log(`${key}: ${value}`);
});

currencies.forEach(function(value, key, map){
  map.set('AFG', 'Afghanistan');
});

console.log(currencies);
currencies.forEach(function(value, key, map){
  console.log(`${key}: ${value}`);
});

// forEach, Set usecase
const currenciesUnique = new Set(['USD', 'EUR', 'USD', 'GBP', 'EUR', 'GBP']);
console.log(currenciesUnique);
currenciesUnique.forEach(function(value, _, set){
  console.log(`${value}: ${_}`);
});


*/
// Coding Challenge #1

/* 
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy. A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far 😉

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

GOOD LUCK 😀

const checkDogs = function (dogsJulia, dogsKate) {
  const newDataJulia = dogsJulia.slice();
  newDataJulia.splice(0, 1);
  newDataJulia.splice(-2);
  console.log(newDataJulia); //dogsJulia.slice(1, -2);
  const dogs = newDataJulia.concat(dogsKate);
  console.log(dogs);
  dogs.forEach(function (dog, i, arr) {
    if (dog >= 3) {
      console.log(`Dog numebr ${i + 1} is an adult, it's ${dog} years old`);
    } else {
      console.log(`Dog number ${i + 1} is a puppy🐶`);
    }
  });
  
};

checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
checkDogs([9, 16, 6, 8, 3], [10, 5, 6, 1, 4]);
*/
/*
//Data transformation: map, filter, reduce

//map
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];


const eurToDoll = 1.1;

let movmentsInDoll =  movements.map(function(mov){
  return eurToDoll * mov;
});

console.log(movmentsInDoll);
// with arrow function metod
movmentsInDoll =  movements.map(mov => eurToDoll * mov);
console.log(movmentsInDoll);
//filter
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const deposit = movements.filter(mov => mov > 0);
console.log(deposit);
const withdrawal = movements.filter(mov => mov < 0);
console.log(withdrawal);

//reduce method
const balance = movements.reduce(function(accumalatore, mov, i, arr){
  return accumalatore + mov;
}, 0);
console.log(balance);
const totWithdr = withdrawal.reduce((acc, mov)=> acc + mov, 100);
console.log(totWithdr);
const totDepo = deposit.reduce((acc, mov) => acc + mov, -50);
console.log(totDepo);
*/
// Coding Challenge #2

/* 
Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
4. Run the function for both test datasets

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
const data1 = [5, 2, 4, 1, 15, 8, 3];
const data2 = [16, 6, 10, 5, 6, 1, 4];

const calcAverageHumanAge = ages =>
ages
.map(age => (age <= 2 ? 2 * age : 16 + age * 4))
.filter(age => age >= 18)
.reduce((acc, age, i, arr) => acc + age / arr.length, 0);


const avg1 = calcAverageHumanAge(data1);
const avg2 = calcAverageHumanAge(data2);
console.log(`The avarage age of data1 is: ${avg1}, and the avarage age of data2 is: ${Math.trunc(avg2)}`);

*/
// .find() method
/*
const jessica = function(accounts){
  const arrayJes = accounts.find((acc) => acc.owner === 'Jessica Davis')
  console.log(arrayJes);
};
jessica(accounts);
*/
/*
// .some() mehtod use case is similar to .includes(), some is usefull for conditions
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
console.log(movements.includes(-130)); // true
const someUseCaseTrue = movements.some(mov => mov > 500);
console.log(someUseCaseTrue);//true
const someUseCaseFalse = movements.some(mov => mov > 5000);
console.log(someUseCaseFalse); //false
*/
/*
// .flat() 
const nestedArray = [[200, 450], [-400, 3000, -650], -130, 70, 1300];
const flatNEstedArray = nestedArray.flat();
console.log(flatNEstedArray);

const deepNestedArray = [[200, 450], [-400, [3000, -650]], [[-130, 70]], 1300];
const flatDeepNestedArray = deepNestedArray.flat(2);
console.log(flatDeepNestedArray);

//.flatMap()
console.log(accounts);
const mapThenFlat = accounts.map(acc => acc.movements).flat();
console.log(mapThenFlat);

const flatMap = accounts.flatMap(acc => acc.movements);
console.log(flatMap);
*/
/*
//Array.from
const x = Array.from({length: 7}, (_,i) => i+1);
console.log(x);
//make a function, 100 time dado casual number
const dado = Array.from({length: 100}, (_, i) => Math.floor(Math.random() * 6) + 1);
console.log(dado);
//take data from html
containerMovements.addEventListener('click', function(){
  const dataRows = document.querySelectorAll('.movements__value');
  const myHtmlArr = Array.from(dataRows).map((data) => Number(data.textContent));

  console.log(myHtmlArr);
});
*/
// array methods practce
// totale of all Deposits in the bank
const totDeposits = accounts
  .flatMap(acc => acc.movements)
  .reduce((tot, mov) => mov > 0 ? tot + mov : tot, 0);
console.log(totDeposits);
//number of depostis over 1000
const depositsOver1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, mov) => mov >= 1000 ? count + 1 : count, 0);
console.log(depositsOver1000);
// creat an object with the sum of deposits and withdrows
// metodo 1: 
const sum = accounts
.flatMap(acc => acc.movements)
.reduce((sum, cur) => {
  (cur > 0 ? sum.deposit += cur : sum.withdawl += cur)
  return sum;
}, 
{
    deposit: 0,
    withdawl: 0
  });
console.log(sum);
//metodo 2:
const sums = accounts
.flatMap(acc => acc.movements)
.reduce((sums, cur) => {
  sums[cur > 0 ?  'deposit' : 'withdawl'] += cur
  return sums;
}, 
{
    deposit: 0,
    withdawl: 0
  });
console.log(sums);
// creare un func per capitalizzare un title ma con le eccezioni
const capTitle = function(title){
  const startStirng = str => str[0].toUpperCase() + str.slice(1);

  const exception = ['a', 'an', 'with', 'and', 'of', 'here'];

  const titleMaker = title
  .toLocaleLowerCase()
  .split(' ')
  .map(word => exception.includes(word) ? word : startStirng(word))
  .join(' ');
  
  console.log(startStirng(titleMaker));
};
capTitle('this IS An EXAMPLE OF my title');
capTitle('and I want GOing WIth this JS so Far');
capTitle('here i Think CAN do A LOT OF things.');

// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).


HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.

GOOD LUCK 😀
*/
//TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];
console.log(dogs);
/*Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).
current > (recommended * 0.90) && current < (recommended * 1.10)*/

//1.Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)

dogs.forEach(obj => obj.recFood = Math.trunc(obj.weight ** 0.75 * 28));
//2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
const sarahDog = dogs
.find(dog => dog.owners.includes('Sarah'));

console.log(sarahDog);

console.log(`Sarah's Dog is eating ${sarahDog.curFood > sarahDog.recFood ? 'too much' : 'too little'}`)

//3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
const ownersEatTooMuch = dogs
.filter(obj => obj.curFood > obj.recFood)
.flatMap(obj => obj.owners);

const ownersEatTooLittle = dogs
.filter(obj => obj.curFood < obj.recFood)
.flatMap(obj => obj.owners);

//4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too Much!`);
console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too Little!`);

//5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
const eatingExactly = dogs.some(obj => obj.curFood === obj.recFood);
console.log(eatingExactly);

//6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false) : current > (recommended * 0.90) && current < (recommended * 1.10)
const okayAmount = obj => obj.curFood > (obj.recFood * 0.90) && obj.curFood < (obj.recFood * 1.10);

console.log(dogs.some(okayAmount));

//7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
console.log(dogs.filter(okayAmount));
//8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)
const sortDogs = dogs.slice().sort((a, b) => a.recFood - b.recFood);
console.log(sortDogs);