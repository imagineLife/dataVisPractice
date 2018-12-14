
//1. load data
d3.json('./data.json', (data) => {
    console.log('data')
    console.log(data)
    
    //stratify data
    let stratData = d3.stratify()

        //set the 'id' of each 'node'
        .id(d => d.name)

        //set the parentID accesor of each 'node'
        .parentId(d => d.parent)
        
        //apply the data to the stratify
        (data)

        //calcs sum of 'parent' nodes
        .sum(d => d.size)

        //optionally sort the data by size here
        .sort((a,b) => a.size - b.size);

    console.log('stratData')
    console.log(stratData)

    //make a ROOT?!
    var root = d3.hierarchy(stratData)  // <-- 1
    .sum(function (d) { return d.size});  // <-- 2
  
    console.log('root')
    console.log(root)

    //a d3 partition fn
    let partition = d3.partition().size([2 * Math.PI, 100])
    let parted = partition(root)

    console.log('parted')
    console.log(parted)
    
        
})