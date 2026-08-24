const button=document.querySelector('.menu-button');
const links=document.querySelector('.nav-links');
button.addEventListener('click',()=>{
  const open=links.classList.toggle('open');
  button.setAttribute('aria-expanded',String(open));
});
links.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>links.classList.remove('open')));
