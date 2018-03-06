const message = 'Eat your greens';
function foo() {
    setTimeout(() => {
        alert(message);
    console.log(this);
});
}
new foo();