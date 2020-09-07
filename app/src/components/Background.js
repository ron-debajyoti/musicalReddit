import React, {Component} from 'react'
import {Howl, Howler} from 'howler'
import styled from 'styled-components/macro'
import seedrandom from 'seedrandom'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import $ from 'jquery'

const Wrapper = styled.div`
    min-height: 85vh;
`


var volume  = 0.6
var totalSounds = 51
var scale_factor = 6,
    note_overlap = 2,
    note_timeout = 200,
    current_notes = 0,
    max_life = 20000

var svg;
var element;
var drawingArea;
var width;
var height;

var svg_text_color = 'white',
    svg_background_color_online = '#fc8d05',
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
        data : this.props.data,
        tempData : this.props.data
    }



    // all the necessary functions 
    load = () =>{
        loadedSounds +=1
        if(loadedSounds === totalSounds){
            all_loaded = true
            let x = Math.floor(Math.random()*1000)
            setTimeout(this.parentPlayFunct, x)
        }
    }

    loadSounds = () => {
        var fn
        // var checker = new Howl({
        //     src: ['/sounds/celesta/c01.ogg']
        // })
        // checker.play()


        for(var i = 1; i <= 24; i++) {
            if (i > 9) {
                fn = 'c0' + i;
            } else {
                fn = 'c00' + i;
            }
            celesta.push(new Howl({
                src : ['/sounds/celesta/' + fn + '.ogg',
                        '/sounds/celesta/' + fn + '.mp3'],
                volume : 0.7,
                onload : this.load(),
                buffer: true,
            }))
            clav.push(new Howl({
                src : ['/sounds/clav/' + fn + '.ogg',
                        '/sounds/clav/' + fn + '.mp3'],
                volume : 0.4,
                onload : this.load(),
                buffer: true,
            }))
        }
      
        for (i = 1; i <= 3; i++) {
            swells.push(new Howl({
                src : ['/sounds/swells/swell' + i + '.ogg',
                        '/sounds/swells/swell' + i + '.mp3'],
                volume : 0.9,
                onload : this.load(),
                buffer: true,
            }));
        }
        console.log('done')
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
            if(dataEntry.subreddit ==='Music' || dataEntry.subreddit ==='gaming' || dataEntry.subreddit ==='ContagiousLaughter' || dataEntry.subreddit ==='AskReddit'){
                clav[index].play()
            } else if (dataEntry.subreddit ==='funny' || dataEntry.subreddit ==='tifu' || dataEntry.subreddit ==='aww' || dataEntry.subreddit ==='pics' || dataEntry.subreddit === 'interestingasfuck' ){
                celesta[index].play()
            } else{
                var i = Math.round(Math.random() * (swells.length-1))
                swells[i].play()
            }

            setTimeout(() => {
                current_notes--
            },note_timeout)
        }
    }


    parentPlayFunct = () => {
        if(this.state.data.length <= 2 && this.state.tempData.length > 0){
            var temp = JSON.parse(JSON.stringify(this.state.tempData))
            this.setState(() => ({
                ...this.state,
                data : temp
            }),() => {
                this.playSound()
            })
        }
        else{
            this.playSound()
        }
    }


    playSound = () =>{
        var dataItem = this.state.data.shift()
        this.play(dataItem.authorName.length*2.1,dataItem)
        this.drawEvent(dataItem,svg)
        setTimeout(this.parentPlayFunct, Math.floor(Math.random() *1000) + 800)
        $('.events-remaining-value').html(this.state.data.length);
    }   

    drawEvent = (data, svg_area) => {
        var starting_opacity = 1;
        var opacity = 1 / (100 / data.authorName.length);
        if (opacity > 0.5) {
            opacity = 0.5;
        }
        var size = data.authorName.length;
        var label_text;
        var ring_radius = 80;
        var ring_anim_duration = 3000;
        svg_text_color = '#FFFFFF';
        if(data.subreddit ==='Music' || data.subreddit ==='gaming' || data.subreddit ==='ContagiousLaughter' || data.subreddit ==='AskReddit'){
            label_text = data.authorName + " posted in subreddit " + data.subreddit
            edit_color = '#0093fc'   
        }
        else if (data.subreddit ==='funny' || data.subreddit ==='tifu' || data.subreddit ==='aww' || data.subreddit ==='pics' || data.subreddit ==='interestingasfuck' ){
            label_text = data.authorName + " posted in subreddit " + data.subreddit
            edit_color = '#00d12a'
            ring_anim_duration = 10000
            ring_radius = 600
        }
        else{
            label_text = data.authorName + " posted in subreddit " + data.subreddit;
            edit_color = '#d12d00';
        }
        var csize = size;
        var no_label = false;
        var type = data.type;
    
        var circle_id = 'd' + ((Math.random() * 100000) | 0);
        var abs_size = Math.abs(size);
        size = Math.max(Math.sqrt(abs_size) * scale_factor, 3);
    
        seedrandom(data.authorName)
        var x = Math.random() * (width - size) + size;
        var y = Math.random() * (height - size) + size;
    
    
        var circle_group = svg_area.append('g')
            .attr('transform', 'translate(' + x + ', ' + y + ')')
            .attr('fill', edit_color)
            .style('opacity', starting_opacity)
    
    
        var ring = circle_group.append('circle');
        ring.attr({r: size, stroke: 'none'});
        ring.transition()
            .attr('r', size + ring_radius)
            .style('opacity', 0)
            .ease(Math.sqrt)
            .duration(ring_anim_duration)
            .remove();
    
        var circle_container = circle_group.append('a');
        circle_container.attr('xlink:href', 'https://www.reddit.com'+data.permalink);
        circle_container.attr('target', '_blank');
        circle_container.attr('fill', svg_text_color);
    
        var circle = circle_container.append('circle');
        circle.classed(type, true);
        circle.attr('r', size)
          .attr('fill', edit_color)
          .transition()
          .duration(max_life)
          .style('opacity', 0)
          .remove();
    
    
        circle_container.on('mouseover', function() {
          circle_container.append('text')
              .text(label_text)
              .classed('label', true)
              .attr('text-anchor', 'middle')
              .attr('font-size', '0.8em')
              .transition()
              .delay(1000)
              .style('opacity', 0)
              .duration(2000)
              .each(function() { no_label = true; })
              .remove();
        });
    
        var text = circle_container.append('text')
            .text(label_text)
            .classed('article-label', true)
            .attr('text-anchor', 'middle')
            .attr('font-size', '0.8em')
            .transition()
            .delay(2000)
            .style('opacity', 0)
            .duration(5000)
            .each(function() { no_label = true; })
            .remove();
    
      // Remove HTML of decayed events
      // Keep it less than 50
      if($('#area svg g').length > 50){
        $('#area svg g:lt(10)').remove();
      }
    }


    componentDidMount(){
        element = document.documentElement
        drawingArea = document.getElementById('area')
        width = window.innerWidth || element.clientWidth || drawingArea.clientWidth
        height = (window.innerHeight)|| (element.clientHeight) || (drawingArea.clientHeight)
        $('svg').css('background-color', svg_background_color_online)
        $('header').css('background-color', svg_background_color_online)
        $('svg text').css('color', svg_text_color); 

        svg = d3.select("#area").append("svg")
        // svg.attr({width: "100%", height: '75vh'});
        svg.style('width','100%')
        svg.style('height','95vh')
        svg.style('background-color', svg_background_color_online)
        Howler.volume(volume)
        this.loadSounds()
    }

    componentDidUpdate(){
    }

    render(){
        return(
            <Wrapper id='area'>
            </Wrapper>
        )
    }
}

export default Background