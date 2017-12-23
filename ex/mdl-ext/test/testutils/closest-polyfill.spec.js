'use strict';
import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import { expect } from 'chai';

describe('closest', () => {

  const fixture = `
<!DOCTYPE html>
<html class="the-document">
<head>
  <meta charset="UTF-8">
  <title>Fixture</title>
</head>
<body>
<div id='mount'>
  <p>Paragraph #1</p>
  <p>Paragraph #2</p>
  <section>
    <p>Paragraph #3</p>
    <p class='foo'>Paragraph #4</p>
    <article>
      <p>Paragraph #5</p>
    </article>
  </section>
  <section>
    <p>Paragraph #6</p>
    <p class='foo'>Paragraph #7</p>
  	<ul class="task-list">
			<li class="task-item">
				<a href="#"><u><span>Hello</span></u></a>
			</li>
		</ul>    
  </section>
</div>
</body>
</html>`;

  let matches_;
  let msmatches_;
  let mozmatches_;
  let webkitmatches_;
  let closest_;

  before ( () => {
    jsdomify.create(fixture);

    matches_ = Element.prototype.matches;
    msmatches_ = Element.prototype.msMatchesSelector;
    mozmatches_ = Element.prototype.mozMatchesSelector;
    webkitmatches_ = Element.prototype.webkitMatchesSelector;
    closest_ = Element.prototype.closest;

    Element.prototype.matches = undefined;
    Element.prototype.msMatchesSelector = undefined;
    Element.prototype.mozMatchesSelector = undefined;
    Element.prototype.webkitMatchesSelector = undefined;
    Element.prototype.closest = undefined;

    requireUncached( './closest-polyfill');
  });

  after ( () => {
    Element.prototype.matches = matches_;
    Element.prototype.msMatchesSelector = msmatches_;
    Element.prototype.mozMatchesSelector = mozmatches_;
    Element.prototype.webkitMatchesSelector = webkitmatches_;
    Element.prototype.closest = closest_;
    jsdomify.destroy();
  });

  describe('matches polyfill', () => {
    it('should match class="foo"', () => {
      const p = document.querySelector('.foo');
      expect(p.matches('.foo')).to.be.true;
    });
  });

  describe('closest polyfill', () => {
    it('should have parent with tagName section', () => {
      const p = document.querySelector('article p');
      const section = p.closest('section');
      expect(section).to.not.be.null;
    });

    it('should have no parent with given tagName', () => {
      const p = document.querySelector('section p');
      const article = p.closest('article');
      expect(article).to.be.null;
    });

    it('should find self', () => {
      const a = document.querySelector('ul li a');
      expect(a).to.equal(a.closest('a[href]'));
    });

    it('should find closest anchor', () => {
      const span = document.querySelector('a span');
      expect(span.parentNode.parentNode).to.equal(span.closest('a'));
    });

    it('should find <html> element', () => {
      const p = document.querySelector('.foo');
      expect(document.documentElement).to.equal(p.closest('.the-document'));
    });

  });

});
