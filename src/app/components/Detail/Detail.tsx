import Button from "../button/Button";
import "./Detail.css";

const Detail = () => {
  return (
    <section className="detail">
      <section className="user">
        <img src="./avatar.png" alt="" />
        <h2>Jane Doe</h2>
        <p>Lorem ipsum dolor sit, amet .</p>
      </section>
      <section className="info">
        {/* Option 1 */}
        <section className="option">
          <section className="title">
            <em>Chat settings</em>
            <img src="./arrowUp.png" alt="" />
          </section>
        </section>

        {/* Option 2 */}
        <section className="option">
          <section className="title">
            <em>Privacy & help</em>
            <img src="./arrowUp.png" alt="" />
          </section>
        </section>

        {/* Option 3 */}
        <section className="option">
          <section className="title">
            <em>Shared photos and messages</em>
            <img src="./arrowDown.png" alt="" />
          </section>
          <section className="photos">
            {/*photo item 1*/}
            <section className="photoItem">
              <section className="photoDetail">
                <img src="" alt="" /> {/*image*/}
              </section>
              <em>photo_2025_2.png</em> {/*photo name*/}
            </section>
            <img src="./download.png" alt="" /> {/*download icon*/}
            {/*photo item 2*/}
            <section className="photoItem">
              <section className="photoDetail">
                <img src="" alt="" /> {/*image*/}
              </section>
              <em>photo_2025_2.png</em> {/*photo name*/}
            </section>
            <img src="./download.png" alt="" /> {/*download icon*/}
            {/*photo item 3*/}
            <section className="photoItem">
              <section className="photoDetail">
                <img src="" alt="" /> {/*image*/}
              </section>
              <em>photo_2025_2.png</em> {/*photo name*/}
            </section>
            <img src="./download.png" alt="" /> {/*download icon*/}
          </section>
        </section>

        {/* Option 4 */}
        <section className="option">
          <section className="title">
            <em>Shared Files</em>
            <img src="./arrowUp.png" alt="" />
          </section>
        </section>
        <Button caption="Block user" />
      </section>
    </section>
  );
};

export default Detail;
