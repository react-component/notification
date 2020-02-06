import React from 'react';
import ReactDOM from 'react-dom';
import Notification from '../src';

require('../assets/index.less');

describe('Notification.Basic', () => {
  it('works', done => {
    Notification.newInstance({}, notification => {
      notification.notice({
        content: <p className="test">1</p>,
        duration: 0.1,
      });
      setTimeout(() => {
        expect(
          TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length,
        ).to.be(1);
      }, 10);
      setTimeout(() => {
        expect(
          TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length,
        ).to.be(0);
        notification.destroy();
        done();
      }, 1000);
    });
  });

  // it('works with custom close icon', done => {
  //   Notification.newInstance(
  //     {
  //       closeIcon: <span className="test-icon">test-close-icon</span>,
  //     },
  //     notification => {
  //       notification.notice({
  //         content: <p className="test">1</p>,
  //         closable: true,
  //         duration: 0,
  //       });
  //       setTimeout(() => {
  //         expect(
  //           TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length,
  //         ).to.be(1);
  //         expect(
  //           TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test-icon')[0]
  //             .innerText,
  //         ).to.be('test-close-icon');
  //         done();
  //       }, 10);
  //     },
  //   );
  // });

  // it('works with multi instance', done => {
  //   Notification.newInstance({}, notification => {
  //     notification.notice({
  //       content: <p className="test">1</p>,
  //       duration: 0.1,
  //     });
  //     notification.notice({
  //       content: <p className="test">2</p>,
  //       duration: 0.1,
  //     });
  //     setTimeout(() => {
  //       expect(
  //         TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length,
  //       ).to.be(2);
  //     }, 10);
  //     setTimeout(() => {
  //       expect(
  //         TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length,
  //       ).to.be(0);
  //       notification.destroy();
  //       done();
  //     }, 1000);
  //   });
  // });

  // it('destroy works', () => {
  //   Notification.newInstance({}, notification => {
  //     notification.notice({
  //       content: (
  //         <p id="test" className="test">
  //           222222
  //         </p>
  //       ),
  //       duration: 0.1,
  //     });
  //     setTimeout(() => {
  //       expect(
  //         TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length,
  //       ).to.be(1);
  //       notification.destroy();
  //       expect(document.getElementById('test')).not.to.be.ok();
  //     }, 10);
  //   });
  // });

  // it('getContainer works', () => {
  //   const id = 'get-container-test';
  //   const div = document.createElement('div');
  //   div.id = id;
  //   div.innerHTML = '<span>test</span>';
  //   document.body.appendChild(div);

  //   Notification.newInstance(
  //     {
  //       getContainer: () => {
  //         return document.getElementById('get-container-test');
  //       },
  //     },
  //     notification => {
  //       notification.notice({
  //         content: (
  //           <p id="test" className="test">
  //             222222
  //           </p>
  //         ),
  //         duration: 1,
  //       });
  //       expect(document.getElementById(id).children.length).to.be(2);
  //       expect(document.getElementById(id)).not.to.be(null);

  //       notification.destroy();

  //       expect(document.getElementById(id).children.length).to.be(1);
  //     },
  //   );
  // });

  // it('remove notify works', done => {
  //   Notification.newInstance({}, notification => {
  //     const key = Date.now();
  //     const close = k => {
  //       notification.removeNotice(k);
  //     };
  //     notification.notice({
  //       content: (
  //         <p className="test">
  //           <button id="closeButton" onClick={close.bind(null, key)}>
  //             close
  //           </button>
  //         </p>
  //       ),
  //       key,
  //       duration: null,
  //     });

  //     setTimeout(() => {
  //       expect(
  //         TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length,
  //       ).to.be(1);
  //       const btnClose = document.getElementById('closeButton');
  //       TestUtils.Simulate.click(btnClose);
  //       setTimeout(() => {
  //         expect(
  //           TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'test').length,
  //         ).to.be(0);
  //         notification.destroy();
  //         done();
  //       }, 1000);
  //     }, 10);
  //   });
  // });

  // it('update notification by key with multi instance', done => {
  //   Notification.newInstance({}, notification => {
  //     const key = 'updatable';
  //     const value = 'value';
  //     const newValue = `new-${value}`;
  //     const notUpdatableValue = 'not-updatable-value';
  //     notification.notice({
  //       content: (
  //         <p id="not-updatable" className="not-updatable">
  //           {notUpdatableValue}
  //         </p>
  //       ),
  //       duration: null,
  //     });
  //     notification.notice({
  //       content: (
  //         <p id="updatable" className="updatable">
  //           {value}
  //         </p>
  //       ),
  //       key,
  //       duration: null,
  //     });

  //     setTimeout(() => {
  //       expect(document.querySelectorAll('.updatable').length).to.be(1);
  //       expect(document.querySelector('.updatable').innerText).to.be(value);

  //       notification.notice({
  //         content: (
  //           <p id="updatable" className="updatable">
  //             {newValue}
  //           </p>
  //         ),
  //         key,
  //         duration: 0.1,
  //       });

  //       setTimeout(() => {
  //         // Text updated successfully
  //         expect(document.querySelectorAll('.updatable').length).to.be(1);
  //         expect(document.querySelector('.updatable').innerText).to.be(newValue);

  //         setTimeout(() => {
  //           // Other notices are not affected
  //           expect(document.querySelectorAll('.not-updatable').length).to.be(1);
  //           expect(document.querySelector('.not-updatable').innerText).to.be(notUpdatableValue);
  //           // Duration updated successfully
  //           expect(document.querySelectorAll('.updatable').length).to.be(0);
  //           notification.destroy();
  //           done();
  //         }, 500);
  //       }, 10);
  //     }, 10);
  //   });
  // });

  // it('freeze notification layer when mouse over', done => {
  //   Notification.newInstance({}, notification => {
  //     notification.notice({
  //       content: (
  //         <p id="freeze" className="freeze">
  //           freeze
  //         </p>
  //       ),
  //       duration: 0.3,
  //     });
  //     setTimeout(() => {
  //       expect(document.querySelectorAll('.freeze').length).to.be(1);
  //       const content = document.getElementById('freeze');
  //       TestUtils.Simulate.mouseEnter(content);
  //       setTimeout(() => {
  //         expect(
  //           TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'freeze').length,
  //         ).to.be(1);
  //         TestUtils.Simulate.mouseLeave(content);
  //         setTimeout(() => {
  //           expect(
  //             TestUtils.scryRenderedDOMComponentsWithClass(notification.component, 'freeze').length,
  //           ).to.be(0);
  //           notification.destroy();
  //           done();
  //         }, 400);
  //       }, 500);
  //     }, 10);
  //   });
  // });

  // it('should work in lifecycle of React component', () => {
  //   class Test extends React.Component {
  //     componentDidMount() {
  //       Notification.newInstance({}, notification => {
  //         notification.notice({
  //           content: <span>In lifecycle</span>,
  //         });
  //       });
  //     }
  //     render() {
  //       return null;
  //     }
  //   }
  //   const container = document.createElement('div');
  //   document.body.appendChild(container);
  //   expect(() => ReactDOM.render(<Test />, container)).to.not.throwException();
  // });

  // it('drop first notice when items limit exceeds', done => {
  //   Notification.newInstance({ maxCount: 1 }, notification => {
  //     const value = 'updated last';
  //     notification.notice({
  //       content: <span className="test-maxcount">simple show</span>,
  //       duration: 3,
  //     });
  //     notification.notice({
  //       content: <span className="test-maxcount">simple show</span>,
  //       duration: 3,
  //     });
  //     notification.notice({
  //       content: <span className="test-maxcount">{value}</span>,
  //       duration: 3,
  //     });

  //     setTimeout(() => {
  //       expect(document.querySelectorAll('.test-maxcount').length).to.be(1);
  //       expect(document.querySelector('.test-maxcount').innerText).to.be(value);
  //       done();
  //     }, 10);
  //   });
  // });

  // it('onClick trigger', done => {
  //   let clicked = 0;
  //   Notification.newInstance({}, notification => {
  //     const key = Date.now();
  //     const close = k => {
  //       notification.removeNotice(k);
  //     };
  //     notification.notice({
  //       content: (
  //         <p className="test">
  //           <button id="closeButton" onClick={close.bind(null, key)}>
  //             close
  //           </button>
  //         </p>
  //       ),
  //       key,
  //       duration: null,
  //       onClick: () => {
  //         clicked += 1;
  //       },
  //     });

  //     setTimeout(() => {
  //       const elements = document.querySelectorAll('.rc-notification-notice');
  //       TestUtils.Simulate.click(elements[elements.length - 1]);

  //       expect(clicked).to.be(1);
  //       notification.destroy();
  //       done();
  //     }, 10);
  //   });
  // });

  // it('Close Notification only trigger onCloase', done => {
  //   let clickCount = 0;
  //   let closeCount = 0;
  //   Notification.newInstance({}, notification => {
  //     notification.notice({
  //       content: <p className="test">1</p>,
  //       closable: true,
  //       onClick: () => {
  //         clickCount++;
  //       },
  //       onClose: () => {
  //         closeCount++;
  //       },
  //     });

  //     setTimeout(() => {
  //       const elements = document.querySelectorAll('.rc-notification-notice-close');
  //       TestUtils.Simulate.click(elements[elements.length - 1]);

  //       expect(clickCount).to.be(0);
  //       expect(closeCount).to.be(1);
  //       notification.destroy();
  //       done();
  //     }, 10);
  //   });
  // });
});
