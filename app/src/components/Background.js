import React, {Component} from 'react'
import {Howl, Howler} from 'howler'
import styled from 'styled-components/macro'
import back from '../images/reddit.svg'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import $ from 'jquery'

const ImageWrapper = styled.img`
    display: inline-block;
    vertical-align: middle;
`


var volume  = 0.6
var totalSounds = 51
var scale_factor = 6,
    note_overlap = 2,
    note_timeout = 300,
    current_notes = 0,
    max_life = 20000

var svg;
var element;
var drawingArea;
var width;
var height;

var svg_text_color = 'white',
    svg_background_color_online = '#0288D1',
    edit_color = '#fff'

var celesta = [],
    clav = [],
    swells = [],
    all_loaded = false,
    loadedSounds=0

class Background extends Component{

    static propTypes = {
        data : PropTypes.array.isRequired
    }    

    state = {
        data : this.props.data
    }



    // all the necessary functions 
    load = () =>{
        loadedSounds +=1
        if(loadedSounds === totalSounds){
            all_loaded = true
            setTimeout(this.playSound, Math.floor(Math.random()*1000))
        }
    }

    loadSounds = () => {
        var fn
        for(var i = 1; i <= 24; i++) {
            if (i > 9) {
                fn = 'c0' + i;
            } else {
                fn = 'c00' + i;
            }
            celesta.push(new Howl({
                src : ['../sounds/celesta/' + fn + '.ogg',
                        '../sounds/celesta/' + fn + '.mp3'],
                volume : 0.7,
                onload : this.load(),
                buffer: true,
            }))
            clav.push(new Howl({
                src : ['../sounds/clav/' + fn + '.ogg',
                        '../sounds/clav/' + fn + '.mp3'],
                volume : 0.4,
                onload : this.load(),
                buffer: true,
            }))
        }
      
        for (i = 1; i <= 3; i++) {
            swells.push(new Howl({
                src : ['../sounds/swells/swell' + i + '.ogg',
                        '../sounds/swells/swell' + i + '.mp3'],
                volume : 0.9,
                onload : this.load(),
                buffer: true,
            }));
        }

    }



    play = (size,dataEntry) => {
        var maxPitch = 100.0
        var logUsed = 1.0715307808111486871978099 
        var pitch = 100 - Math.min(maxPitch, Math.log(size + logUsed) / Math.log(logUsed))
        var index = Math.floor(pitch / 100.0 * Object.keys(celesta).length)
        var fuzz = Math.floor(Math.random() * 4) - 2
        index += fuzz
        index = Math.min(Object.keys(celesta).length - 1, index)
        index = Math.max(1, index)

        if(current_notes < note_overlap){
            current_notes++
            //console.log('reached here !')
            if(dataEntry.subreddit ==='Music' || dataEntry.subreddit ==='tifu' || dataEntry.subreddit ==='ContagiousLaughter'){
                console.log(clav[index])
                clav[index].play()
            } else if (dataEntry.subreddit ==='funny' || dataEntry.subreddit ==='gaming' || dataEntry.subreddit ==='aww' || dataEntry.subreddit ==='pics'){
                console.log(celesta[index])
                celesta[index].play()
            } else{
                var i = Math.round(Math.random() * (swells.length-1))
                console.log(swells[i])
                swells[i].play()
            }

            setTimeout(() => {
                current_notes--
            },note_timeout)
        }
    }




    playSound = () =>{
        this.state.data.forEach(dataItem => {
            this.play(1,dataItem)
        })
    }

    componentDidMount(){
        element = document.documentElement
        drawingArea = document.getElementById('area')
        width = window.innerWidth || element.clientWidth || drawingArea.clientWidth;
        height = (window.innerHeight  - $('header').height())|| (element.clientHeight - $('header').height()) || (drawingArea.clientHeight - $('header').height());
        $('svg').css('background-color', svg_background_color_online);
        $('header').css('background-color', svg_background_color_online);
        $('svg text').css('color', svg_text_color); 

        svg = d3.select("#area").append("svg");
        svg.attr({width: width, height: height});
        svg.style('background-color', svg_background_color_online);
        Howler.volume(volume)
        this.loadSounds()

    }

    render(){
        return(
            <div id='area'>
                <ImageWrapper src={back} alt='back' />
            </div>
        )
    }
}

export default Background