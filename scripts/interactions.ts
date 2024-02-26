import { ethers } from "hardhat";
import helpers from "@nomicfoundation/hardhat-toolbox/network-helpers";

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  await helpers.impersonateAccount(USDCHolder);
  const impersonatedSigner = await ethers.getSigner(USDCHolder);

  const USDC = await ethers.getContractAt("IERC20", USDCAddress);
  const DAI = await ethers.getContractAt("IERC20", DAIAddress);
  const WETH = await ethers.getContractAt("IERC20", wethAddress);

  const ROUTER = await ethers.getContractAt("IUniswap", UNIRouter);

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

  // Approve spending
  console.log("Approving USDC spending...");
  const approveTx = await USDC.connect(impersonatedSigner).approve(
    UNIRouter,
    ethers.MaxUint256
  );
  await approveTx.wait();
  console.log("USDC spending approved.");

  console.log("Approving DAI spending...");
  const approveDaiTx = await DAI.connect(impersonatedSigner).approve(
    UNIRouter,
    ethers.MaxUint256
  );
  await approveDaiTx.wait();
  console.log("DAI spending approved.");

  
  const amountOut = ethers.parseUnits("10", 6); // Example amount

  console.log("Adding liquidity...");
  const addLiqTx = await ROUTER.connect(impersonatedSigner).addLiquidity(
    USDCAddress,
    DAIAddress,
    amountOut, 
    amountOut, 
    0, 
    0, 
    impersonatedSigner.address,
    deadline
  );
  await addLiqTx.wait();
  console.log("Liquidity added.");

  console.log("Removing liquidity...");
  const removeLiqTx = await ROUTER.connect(impersonatedSigner).removeLiquidity(
    USDCAddress,
    DAIAddress,
    ethers.parseUnits("1", 6),
    0,
    0,
    impersonatedSigner.address,
    deadline
  );
  await removeLiqTx.wait();
  console.log("Liquidity removed.");

  const finalUSDCBal = await USDC.balanceOf(impersonatedSigner.address);
  const finalDAIBal = await DAI.balanceOf(impersonatedSigner.address);
  console.log(`Final USDC Balance: ${ethers.formatUnits(finalUSDCBal, 6)}`);
  console.log(`Final DAI Balance: ${ethers.formatUnits(finalDAIBal, 18)}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});