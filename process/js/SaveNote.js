var React = require('react');
var bootstrap = require('bootstrap');
var $ = jQuery = require('jquery');
var Statistics = require('./Statistics');
var firebase = require('firebase');

var SaveNote = class SaveNote extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            score: 0.5
        };

        this.textAnalytics = this.textAnalytics.bind(this);
        this.saveToDB = this.saveToDB.bind(this);
    }

    saveToDB(score) {
      var content = this.props.content;
      var title = this.props.title;

      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();

      if(dd<10) {
          dd='0'+dd
      }
      if(mm<10) {
          mm='0'+mm
      }
      today = yyyy+'-'+mm+'-'+dd;

      var fb = firebase.database().ref('notes');
      var fbSnapshot = fb.push({
        objKey: null,
        date: today,
        happiness: score,
        keyword : title,
        note : content,
        ownerName : "Meng Dong"
      });
      var itemKey = fbSnapshot.key;
      console.log(itemKey);
      var fbChild = fb.child(itemKey);
      fbChild.update({
          objKey: itemKey,
          date: today,
          happiness: score,
          keyword : title,
          note : content,
          ownerName : "Meng Dong"
      });
    }

    textAnalytics() {
        var params = {
            // Request parameters
        };

        var content = this.props.content;
        var title = this.props.title;

        var requestText = {
            "documents": [
                {
                    "language": "en",
                    "id": "01",
                    "text": title + ' ' + content
                }
            ]
        };
        var requestObj = JSON.stringify(requestText);
        console.log(requestText);

        $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment?" + $.param(params),
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","f98e8c46836a4904b3d878d77667bb72");
            },
            type: "POST",
            // Request body

            data: requestObj,
        })
        .done(function(data) {
            console.log(data);
            var curScore = data['documents'][0]['score'];
            console.log(curScore);
            this.setState({
                score: curScore
            });
            $('#myModal').modal('show');
            this.saveToDB(curScore);
        }.bind(this))
        .fail(function() {
            alert("error");
        });

        console.log(this.state.score);
    }

    render() {
        return (
            <div>
            <div className="saveButton" onClick={this.textAnalytics}>
                <button type="button" className="btn btn-info btn-lg" >Save</button>
            </div>
            <div id="myModal" className="modal fade" role="dialog">
                <div id="statisticsDialog" className="modal-dialog">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal">&times;</button>
                        <h4 className="modal-title">Saved</h4>
                    </div>
                    <div className="modal-body">
                        <p>{this.props.content} Your score is: {this.state.score}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
            </div>
        );
    }

}
module.exports = SaveNote;
