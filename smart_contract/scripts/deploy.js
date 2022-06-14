const main = async () => {
    const trasactionFactory = await hre.ethers.getContractFactory('Transactions')
    const transactionContract = await trasactionFactory.deploy()

    await transactionContract.deployed()

    console.log('transactions deployed to:', transactionContract.address)
}

    ; (async () => {
        try {
            await main()
            process.exit(0)
        }
        catch (error) {
            console.error(error)
            process.exit(1)
        }
    })()