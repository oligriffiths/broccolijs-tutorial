const message = 'Eat your greens';
function foo() {
    setTimeout(() => {
    console.log(message);
    console.log(this);
});
}
new foo();